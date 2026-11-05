'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type {
  AdminDsaProblem,
  AdminInterviewQuestion,
  ContentChange,
  DsaProblemInput,
  InterviewQuestionInput,
} from '@backendmasters/shared';
import { ApiError } from '@/lib/api/client';
import { NOT_REVALIDATED_WARNING, type ActionResult } from './action-result';
import { adminFetch } from './api';
import { dsaProblemSchema, interviewQuestionSchema, toFieldErrors, uuidSchema } from './schemas';

/** Public endpoints, like every Server Action. See actions.ts. */
const COLLECTIONS = {
  dsa: { api: '/admin/dsa-problems', page: '/admin/dsa' },
  question: { api: '/admin/interview-questions', page: '/admin/interview' },
} as const;

type Collection = keyof typeof COLLECTIONS;

function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof ApiError) {
    return error.status === 401
      ? { ok: false, error: 'Your session has ended. Sign in again in a new tab, then retry.' }
      : { ok: false, error: error.message };
  }
  return {
    ok: false,
    error: "The server couldn't be reached. Your changes are still on this page.",
  };
}

function toResult<T>({ result, revalidated }: ContentChange<T>): ActionResult<T> {
  return revalidated
    ? { ok: true, data: result }
    : { ok: true, data: result, warning: NOT_REVALIDATED_WARNING };
}

function jsonBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function save<T>(
  collection: Collection,
  id: string | null,
  expectedUpdatedAt: string | null,
  values: unknown,
): Promise<ActionResult<T>> {
  if (id !== null && !uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid id' };
  const { api } = COLLECTIONS[collection];
  try {
    if (id === null) {
      return { ok: true, data: (await adminFetch<T>(api, jsonBody('POST', values))).data };
    }
    const { data } = await adminFetch<ContentChange<T>>(
      `${api}/${id}`,
      jsonBody('PUT', { ...(values as object), expectedUpdatedAt }),
    );
    return toResult(data);
  } catch (error) {
    return failure(error);
  }
}

async function changeStatus<T>(
  collection: Collection,
  id: string,
  action: 'publish' | 'unpublish',
): Promise<ActionResult<T>> {
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid id' };
  try {
    const { data } = await adminFetch<ContentChange<T>>(
      `${COLLECTIONS[collection].api}/${id}/${action}`,
      { method: 'POST' },
    );
    return toResult(data);
  } catch (error) {
    return failure(error);
  }
}

async function remove(collection: Collection, id: string): Promise<ActionResult> {
  if (!uuidSchema.safeParse(id).success) return { ok: false, error: 'Invalid id' };
  const { api, page } = COLLECTIONS[collection];
  try {
    await adminFetch(`${api}/${id}`, { method: 'DELETE' });
  } catch (error) {
    return failure(error);
  }
  revalidatePath(page, 'layout');
  redirect(page);
}

export async function saveDsaProblem(
  id: string | null,
  expectedUpdatedAt: string | null,
  input: DsaProblemInput,
): Promise<ActionResult<AdminDsaProblem>> {
  const parsed = dsaProblemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Fix the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  return save('dsa', id, expectedUpdatedAt, parsed.data);
}

export async function publishDsaProblem(id: string): Promise<ActionResult<AdminDsaProblem>> {
  return changeStatus('dsa', id, 'publish');
}

export async function unpublishDsaProblem(id: string): Promise<ActionResult<AdminDsaProblem>> {
  return changeStatus('dsa', id, 'unpublish');
}

export async function deleteDsaProblem(id: string): Promise<ActionResult> {
  return remove('dsa', id);
}

export async function saveInterviewQuestion(
  id: string | null,
  expectedUpdatedAt: string | null,
  input: InterviewQuestionInput,
): Promise<ActionResult<AdminInterviewQuestion>> {
  const parsed = interviewQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Fix the highlighted fields.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  return save('question', id, expectedUpdatedAt, parsed.data);
}

export async function publishInterviewQuestion(
  id: string,
): Promise<ActionResult<AdminInterviewQuestion>> {
  return changeStatus('question', id, 'publish');
}

export async function unpublishInterviewQuestion(
  id: string,
): Promise<ActionResult<AdminInterviewQuestion>> {
  return changeStatus('question', id, 'unpublish');
}

export async function deleteInterviewQuestion(id: string): Promise<ActionResult> {
  return remove('question', id);
}
