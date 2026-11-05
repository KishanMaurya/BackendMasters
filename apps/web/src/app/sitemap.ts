import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { contentPath } from '@backendmasters/shared';
import { CATEGORIES } from '@/features/catalog/categories';
import { getSitemapEntries } from '@/features/seo/queries';
import { env } from '@/lib/env';

const STATIC_PATHS = ['/', '/learn', '/articles', '/about', ...CATEGORIES.map(({ href }) => href)];

/** Built per request from cached data, so publishing updates it like any other page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const absolute = (path: string) => new URL(path, env.NEXT_PUBLIC_SITE_URL).href;
  const entries = (await getSitemapEntries()) ?? [];

  return [
    ...STATIC_PATHS.map((path) => ({ url: absolute(path) })),
    ...entries.map(({ kind, slug, updatedAt }) => ({
      url: absolute(contentPath(kind, slug)),
      lastModified: updatedAt,
    })),
  ];
}
