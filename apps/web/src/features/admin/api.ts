import 'server-only';
import { redirect } from 'next/navigation';
import type { PaginationMeta } from '@backendmasters/shared';
import { ApiError, apiFetch } from '@/lib/api/client';
import { createAuthClient } from '@/lib/supabase/server';

/** Calls the admin API as the signed-in user. The token never reaches the browser. */
export async function adminFetch<T, M extends object = object>(path: string, init?: RequestInit) {
  const auth = await createAuthClient();
  const session = auth ? (await auth.auth.getSession()).data.session : null;
  if (!session) throw new ApiError(401, 'UNAUTHORIZED', 'Sign in to continue');

  return apiFetch<T, M>(path, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${session.access_token}` },
  });
}

/** For pages: sends anyone without access to the sign-in page. */
export async function loadAdmin<T>(path: string): Promise<T> {
  try {
    return (await adminFetch<T>(path)).data;
  } catch (error) {
    redirectIfRefused(error);
    throw error;
  }
}

/** The same, for a record that may not exist. */
export async function loadAdminOptional<T>(path: string): Promise<T | null> {
  try {
    return (await adminFetch<T>(path)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    redirectIfRefused(error);
    throw error;
  }
}

export async function loadAdminPage<T>(path: string) {
  try {
    const { data, meta } = await adminFetch<T[], { pagination: PaginationMeta }>(path);
    return { items: data, pagination: meta.pagination };
  } catch (error) {
    redirectIfRefused(error);
    throw error;
  }
}

function redirectIfRefused(error: unknown) {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    redirect('/admin/login');
  }
}
