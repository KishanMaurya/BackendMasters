import { cacheLife, cacheTag } from 'next/cache';
import type {
  PaginationMeta,
  SearchResult,
  SearchSuggestion,
  TagSummary,
} from '@backendmasters/shared';
import { CONTENT_CACHE_TAG } from '@/features/articles/queries';
import { apiFetch } from '@/lib/api/client';
import { MIN_SUGGESTION_LENGTH, searchApiPath, type SearchFilters } from './search-params';

function retrySoon() {
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
}

export interface SearchPage {
  items: SearchResult[];
  pagination: PaginationMeta;
}

export async function searchContent(filters: SearchFilters): Promise<SearchPage | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    const { data, meta } = await apiFetch<SearchResult[], { pagination: PaginationMeta }>(
      searchApiPath(filters),
    );
    return { items: data, pagination: meta.pagination };
  } catch {
    retrySoon();
    return null;
  }
}

export async function getSuggestions(query: string): Promise<SearchSuggestion[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  if (query.length < MIN_SUGGESTION_LENGTH) return [];
  try {
    const params = new URLSearchParams({ q: query });
    return (await apiFetch<SearchSuggestion[]>(`/search/suggestions?${params.toString()}`)).data;
  } catch {
    retrySoon();
    return [];
  }
}

/** The tag menu is optional, so a failure just empties it. */
export async function getAllTags(): Promise<TagSummary[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    return (await apiFetch<TagSummary[]>('/tags')).data;
  } catch {
    retrySoon();
    return [];
  }
}
