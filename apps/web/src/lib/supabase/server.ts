import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { env } from '@/lib/env';
import { sessionCookieOptions } from './session-cookies';

/**
 * The only Supabase client in the web app, used for admin sign-in and nothing else.
 * All content goes through the NestJS API. Returns null when sign-in isn't configured.
 */
export async function createAuthClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;

  // The auth client reads the clock, which Next only allows once a page is rendering for a request.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, sessionCookieOptions(options));
            }
          } catch {
            // Server Components can't write cookies. The proxy has already refreshed the session.
          }
        },
      },
    },
  );
}
