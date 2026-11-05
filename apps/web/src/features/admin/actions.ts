'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { createElement } from 'react';
import type {
  AdminArticle,
  AdminCategory,
  AdminTag,
  ArticleInput,
  CategoryInput,
  ContentChange,
  TagInput,
  UploadedImage,
} from '@backendmasters/shared';
import { MAX_IMAGE_BYTES } from '@backendmasters/shared';
import { renderMarkdown } from '@/features/markdown/render-markdown';
import { ApiError } from '@/lib/api/client';
import { createAuthClient } from '@/lib/supabase/server';
import { NOT_REVALIDATED_WARNING, type ActionResult } from './action-result';
import { adminFetch } from './api';
import {
  articleSchema,
  categorySchema,
  isoDateSchema,
  signInSchema,
  tagSchema,
  toFieldErrors,
  uuidSchema,
} from './schemas';

/**
 * Server Actions are public endpoints, so nothing here relies on the page having checked access.
 * Each one validates its input and goes through the API, which checks the caller on every call.
 */
const UPLOAD_TIMEOUT_MS = 30_000;
const MAX_PREVIEW_LENGTH = 200_000;

function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return {
        ok: false,
        error: 'Your session has ended. Sign in again in a new tab, then retry.',
      };
    }
    return { ok: false, error: error.message };
  }
  return {
    ok: false,
    error: "The server couldn't be reached. Your changes are still on this page.",
  };
}

function refreshAdminPages() {
  revalidatePath('/admin', 'layout');
}

function changed<T>({ result, revalidated }: ContentChange<T>): ActionResult<T> {
  return revalidated
    ? { ok: true, data: result }
    : { ok: true, data: result, warning: NOT_REVALIDATED_WARNING };
}

export async function signIn(_: string | null, form: FormData): Promise<string | null> {
  const parsed = signInSchema.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  if (!parsed.success) return 'Enter your email address and password.';

  const auth = await createAuthClient();
  if (!auth) return 'Sign-in is not configured on this server.';

  const { error } = await auth.auth.signInWithPassword(parsed.data);
  // The same message either way, so it doesn't reveal which addresses have accounts.
  if (error) {
    return error.status === 429
      ? 'Too many attempts. Please wait a few minutes and try again.'
      : 'That email address or password is not correct.';
  }

  try {
    await adminFetch('/admin/me');
  } catch (caught) {
    await auth.auth.signOut();
    return caught instanceof ApiError && caught.status === 403
      ? "This account doesn't have administrator access."
      : "Signed in, but the server couldn't be reached. Please try again.";
  }
  redirect('/admin');
}

export async function signOut(): Promise<void> {
  const auth = await createAuthClient();
  await auth?.auth.signOut();
  redirect('/admin/login');
}

export async function saveArticle(
  id: string | null,
  expectedUpdatedAt: string | null,
  input: ArticleInput,
): Promise<ActionResult<AdminArticle>> {
  const parsed = articleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Fix the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  if (id !== null && !uuidSchema.safeParse(id).success)
    return { ok: false, error: 'Invalid article' };

  try {
    if (id === null) {
      const { data } = await adminFetch<AdminArticle>(
        '/admin/articles',
        jsonBody('POST', parsed.data),
      );
      return { ok: true, data };
    }
    const { data } = await adminFetch<ContentChange<AdminArticle>>(
      `/admin/articles/${id}`,
      jsonBody('PUT', { ...parsed.data, expectedUpdatedAt }),
    );
    return changed(data);
  } catch (error) {
    return failure(error);
  }
}

export async function publishArticle(
  id: string,
  publishedAt?: string,
): Promise<ActionResult<AdminArticle>> {
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid article' };
  if (publishedAt !== undefined && !isoDateSchema.safeParse(publishedAt).success) {
    return { ok: false, error: 'Choose a valid date' };
  }
  try {
    const { data } = await adminFetch<ContentChange<AdminArticle>>(
      `/admin/articles/${id}/publish`,
      jsonBody('POST', publishedAt ? { publishedAt } : {}),
    );
    return changed(data);
  } catch (error) {
    return failure(error);
  }
}

export async function unpublishArticle(id: string): Promise<ActionResult<AdminArticle>> {
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid article' };
  try {
    const { data } = await adminFetch<ContentChange<AdminArticle>>(
      `/admin/articles/${id}/unpublish`,
      { method: 'POST' },
    );
    return changed(data);
  } catch (error) {
    return failure(error);
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid article' };
  try {
    await adminFetch(`/admin/articles/${id}`, { method: 'DELETE' });
  } catch (error) {
    return failure(error);
  }
  refreshAdminPages();
  redirect('/admin/articles');
}

export async function uploadImage(form: FormData): Promise<ActionResult<UploadedImage>> {
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Choose an image' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Images can be up to 5 MB' };

  const body = new FormData();
  body.set('file', file);
  try {
    const { data } = await adminFetch<UploadedImage>('/admin/media/images', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
    });
    return { ok: true, data };
  } catch (error) {
    return failure(error);
  }
}

/** Renders through the same sanitized pipeline as the live page, so the preview is exact. */
export async function previewMarkdown(markdown: string): Promise<ActionResult<ReactNode>> {
  if (typeof markdown !== 'string' || markdown.length > MAX_PREVIEW_LENGTH) {
    return { ok: false, error: 'This article is too long to preview' };
  }
  try {
    await adminFetch('/admin/me');
  } catch (error) {
    return failure(error);
  }
  const { content } = await renderMarkdown(markdown);
  return { ok: true, data: createElement('article', { className: 'bm-article' }, content) };
}

export async function saveCategory(
  id: string,
  input: CategoryInput,
): Promise<ActionResult<AdminCategory>> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Fix the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid category' };
  try {
    const { data } = await adminFetch<ContentChange<AdminCategory>>(
      `/admin/categories/${id}`,
      jsonBody('PATCH', parsed.data),
    );
    refreshAdminPages();
    return changed(data);
  } catch (error) {
    return failure(error);
  }
}

export async function createTag(input: TagInput): Promise<ActionResult<AdminTag>> {
  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Fix the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  try {
    const { data } = await adminFetch<AdminTag>('/admin/tags', jsonBody('POST', parsed.data));
    refreshAdminPages();
    return { ok: true, data };
  } catch (error) {
    return failure(error);
  }
}

export async function updateTag(id: string, input: TagInput): Promise<ActionResult<AdminTag>> {
  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Fix the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid tag' };
  try {
    const { data } = await adminFetch<ContentChange<AdminTag>>(
      `/admin/tags/${id}`,
      jsonBody('PATCH', parsed.data),
    );
    refreshAdminPages();
    return changed(data);
  } catch (error) {
    return failure(error);
  }
}

export async function deleteTag(id: string): Promise<ActionResult> {
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid tag' };
  try {
    const { data } = await adminFetch<{ revalidated: boolean }>(`/admin/tags/${id}`, {
      method: 'DELETE',
    });
    refreshAdminPages();
    return data.revalidated
      ? { ok: true, data: undefined }
      : { ok: true, data: undefined, warning: NOT_REVALIDATED_WARNING };
  } catch (error) {
    return failure(error);
  }
}

function jsonBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
