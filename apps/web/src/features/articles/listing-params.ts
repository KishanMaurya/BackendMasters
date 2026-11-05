import { CATEGORY_SLUGS, type CategorySlug, type Difficulty } from '@backendmasters/shared';

export const ARTICLES_PER_PAGE = 12;
export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

const TAG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface ArticleFilters {
  page: number;
  category?: CategorySlug;
  difficulty?: Difficulty;
  tag?: string;
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Anything unrecognised in the URL is ignored, so a bad link still shows a useful page. */
export function parseFilters(raw: RawParams): ArticleFilters {
  const filters: ArticleFilters = { page: 1 };

  const page = Number(first(raw.page));
  if (Number.isInteger(page) && page > 0) filters.page = page;

  const category = first(raw.category);
  if ((CATEGORY_SLUGS as readonly string[]).includes(category ?? '')) {
    filters.category = category as CategorySlug;
  }

  const difficulty = first(raw.difficulty);
  if ((DIFFICULTIES as readonly string[]).includes(difficulty ?? '')) {
    filters.difficulty = difficulty as Difficulty;
  }

  const tag = first(raw.tag);
  if (tag && TAG_PATTERN.test(tag)) filters.tag = tag;

  return filters;
}

export function toSearchParams(filters: ArticleFilters): URLSearchParams {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(ARTICLES_PER_PAGE),
  });
  if (filters.category) params.set('category', filters.category);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.tag) params.set('tag', filters.tag);
  return params;
}

/** A listing URL. Changing a filter should go back to page one, so page is only kept if passed. */
export function listingHref(filters: Partial<ArticleFilters>): string {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `/articles?${query}` : '/articles';
}
