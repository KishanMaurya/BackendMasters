import { cacheLife, cacheTag } from 'next/cache';
import type {
  ArticleDetail,
  ArticleSummary,
  CategorySlug,
  CategorySummary,
  PaginationMeta,
  TagUsage,
} from '@backendmasters/shared';
import { ApiError, apiFetch } from '@/lib/api/client';
import { toSearchParams, type ArticleFilters } from './listing-params';

/**
 * The one place pages get article data from.
 *
 * Results are cached, so pages stay fast and static. When the API can't be reached, list
 * functions return null rather than an empty list, because "nothing is published" and
 * "we couldn't check" should read differently. A failed result expires quickly.
 */
export type ArticleListResult = ArticleSummary[] | null;

/** The API asks for this to be revalidated when content changes. See app/api/revalidate. */
export const CONTENT_CACHE_TAG = 'content';

const HOME_PAGE_SIZE = 6;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function retrySoon() {
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
}

async function listArticles(params: Record<string, string>): Promise<ArticleListResult> {
  try {
    const { data } = await apiFetch<ArticleSummary[]>(
      `/articles?${new URLSearchParams(params).toString()}`,
    );
    return data;
  } catch {
    retrySoon();
    return null;
  }
}

export async function getFeaturedArticles(): Promise<ArticleListResult> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  return listArticles({ featured: 'true', pageSize: String(HOME_PAGE_SIZE) });
}

export async function getLatestArticles(): Promise<ArticleListResult> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  return listArticles({ pageSize: String(HOME_PAGE_SIZE) });
}

export async function getArticlesByCategory(slug: CategorySlug): Promise<ArticleListResult> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  return listArticles({ category: slug, pageSize: '50' });
}

/** Counts are a small enhancement, so a failure simply leaves them out. */
export async function getArticleCounts(): Promise<Partial<Record<CategorySlug, number>>> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    const { data } = await apiFetch<CategorySummary[]>('/categories');
    return Object.fromEntries(data.map(({ slug, articleCount }) => [slug, articleCount]));
  } catch {
    retrySoon();
    return {};
  }
}

/** Published articles per topic tag. Topics are still listed if this fails. */
export async function getTagUsage(category: CategorySlug): Promise<Record<string, number>> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    const { data } = await apiFetch<TagUsage[]>(`/tags/usage?category=${category}`);
    return Object.fromEntries(data.map(({ slug, articleCount }) => [slug, articleCount]));
  } catch {
    retrySoon();
    return {};
  }
}

export interface ArticlePage {
  items: ArticleSummary[];
  pagination: PaginationMeta;
}

export async function getArticlePage(filters: ArticleFilters): Promise<ArticlePage | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    const { data, meta } = await apiFetch<ArticleSummary[], { pagination: PaginationMeta }>(
      `/articles?${toSearchParams(filters).toString()}`,
    );
    return { items: data, pagination: meta.pagination };
  } catch {
    retrySoon();
    return null;
  }
}

/**
 * Null means the article doesn't exist. Any other failure throws, so an outage shows the
 * error page, is never cached, and never tells a crawler that a real article is gone.
 */
export async function getArticle(slug: string): Promise<ArticleDetail | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  if (!SLUG_PATTERN.test(slug)) return null;
  try {
    const { data } = await apiFetch<ArticleDetail>(`/articles/${slug}`);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Related articles are optional, so a failure just leaves the section out. */
export async function getRelatedArticles(slug: string): Promise<ArticleSummary[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    const { data } = await apiFetch<ArticleSummary[]>(`/articles/${slug}/related`);
    return data;
  } catch {
    retrySoon();
    return [];
  }
}

/** Used at build time only. Not cached, and an empty result is handled by the caller. */
export async function getArticleSlugs(): Promise<string[]> {
  try {
    const { data } = await apiFetch<string[]>('/articles/slugs');
    return data;
  } catch {
    return [];
  }
}
