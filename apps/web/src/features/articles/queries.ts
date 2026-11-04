import { cacheLife, cacheTag } from 'next/cache';
import type { ArticleSummary, CategorySlug, CategorySummary } from '@backendmasters/shared';
import { apiFetch } from '@/lib/api/client';

/**
 * The one place pages get article data from.
 *
 * Results are cached, so pages stay fast and static. When the API can't be reached, list
 * functions return null rather than an empty list, because "nothing is published" and
 * "we couldn't check" should read differently. A failed result expires quickly.
 */
export type ArticleListResult = ArticleSummary[] | null;

/** Revalidated on publish from Phase 5. Until then, content refreshes hourly. */
export const CONTENT_CACHE_TAG = 'content';

const HOME_PAGE_SIZE = 6;

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
