import type { CookieOptions } from '@supabase/ssr';

/**
 * The session is only ever read on the server, so scripts in the browser don't need it, and
 * public pages don't need to receive it at all. Applied to every write, including deletions,
 * because a browser only removes a cookie when the path matches.
 */
export function sessionCookieOptions(options: CookieOptions): CookieOptions {
  return {
    ...options,
    path: '/admin',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}
