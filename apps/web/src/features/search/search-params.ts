import { CATEGORY_SLUGS, type CategorySlug } from '@backendmasters/shared';

export const RESULTS_PER_PAGE = 12;
export const MIN_SUGGESTION_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;
const TAG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export interface SearchFilters {
  q: string;
  page: number;
  category?: CategorySlug;
  tag?: string;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Anything unusable in the URL is ignored, so a bad link still shows a useful page. */
export function parseSearchFilters(raw: RawParams): SearchFilters {
  const filters: SearchFilters = {
    q: first(raw.q)?.trim().slice(0, MAX_QUERY_LENGTH) ?? '',
    page: 1,
  };

  const page = Number(first(raw.page));
  if (Number.isInteger(page) && page > 0) filters.page = page;

  const category = first(raw.category);
  if (CATEGORY_SLUGS.includes(category as CategorySlug))
    filters.category = category as CategorySlug;

  const tag = first(raw.tag);
  if (tag && TAG_PATTERN.test(tag)) filters.tag = tag;

  return filters;
}

function shared(filters: Partial<SearchFilters>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.tag) params.set('tag', filters.tag);
  return params;
}

export function searchHref(filters: Partial<SearchFilters>): string {
  const params = shared(filters);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `/search?${query}` : '/search';
}

export function searchApiPath(filters: SearchFilters): string {
  const params = shared(filters);
  params.set('page', String(filters.page));
  params.set('pageSize', String(RESULTS_PER_PAGE));
  return `/search?${params.toString()}`;
}
