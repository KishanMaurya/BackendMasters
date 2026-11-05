import { revalidateTag } from 'next/cache';
import { secretsMatch } from '@/features/admin/revalidate-secret';
import { CONTENT_CACHE_TAG } from '@/features/articles/queries';
import { env } from '@/lib/env';

/** Called by the API when content changes. The tag is fixed, so callers can't choose one. */
export async function POST(request: Request) {
  if (!secretsMatch(request.headers.get('x-revalidate-secret'), env.REVALIDATE_SECRET)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }
  // Readers should never see a page an administrator just took down.
  revalidateTag(CONTENT_CACHE_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
