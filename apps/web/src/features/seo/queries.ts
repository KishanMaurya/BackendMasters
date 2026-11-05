import { cacheLife, cacheTag } from 'next/cache';
import type { SitemapEntry } from '@backendmasters/shared';
import { CONTENT_CACHE_TAG } from '@/features/articles/queries';
import { apiFetch } from '@/lib/api/client';

/** Null when the API can't be reached, and retried soon, so an outage never empties the sitemap. */
export async function getSitemapEntries(): Promise<SitemapEntry[] | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    return (await apiFetch<SitemapEntry[]>('/sitemap-entries')).data;
  } catch {
    cacheLife({ stale: 30, revalidate: 60, expire: 600 });
    return null;
  }
}
