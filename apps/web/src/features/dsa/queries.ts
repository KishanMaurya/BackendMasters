import { cacheLife, cacheTag } from 'next/cache';
import type {
  DsaProblemDetail,
  DsaProblemSummary,
  DsaTopicCount,
  PaginationMeta,
} from '@backendmasters/shared';
import { CONTENT_CACHE_TAG } from '@/features/articles/queries';
import { ApiError, apiFetch } from '@/lib/api/client';
import { dsaApiPath, type DsaFilters } from './listing-params';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function retrySoon() {
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
}

export interface DsaPage {
  items: DsaProblemSummary[];
  pagination: PaginationMeta;
}

export async function getDsaPage(filters: DsaFilters): Promise<DsaPage | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    const { data, meta } = await apiFetch<DsaProblemSummary[], { pagination: PaginationMeta }>(
      dsaApiPath(filters),
    );
    return { items: data, pagination: meta.pagination };
  } catch {
    retrySoon();
    return null;
  }
}

/** Counts are a small enhancement, so a failure simply leaves them out. */
export async function getDsaTopicCounts(): Promise<DsaTopicCount[]> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    return (await apiFetch<DsaTopicCount[]>('/dsa-problems/topics')).data;
  } catch {
    retrySoon();
    return [];
  }
}

/** Null means it doesn't exist. Other failures throw, so an outage is never cached as a 404. */
export async function getDsaProblem(slug: string): Promise<DsaProblemDetail | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  if (!SLUG_PATTERN.test(slug)) return null;
  try {
    return (await apiFetch<DsaProblemDetail>(`/dsa-problems/${slug}`)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Used at build time only. */
export async function getDsaSlugs(): Promise<string[]> {
  try {
    return (await apiFetch<string[]>('/dsa-problems/slugs')).data;
  } catch {
    return [];
  }
}
