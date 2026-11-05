import { cacheLife, cacheTag } from 'next/cache';
import type {
  InterviewFacets,
  InterviewQuestionDetail,
  InterviewQuestionSummary,
  PaginationMeta,
} from '@backendmasters/shared';
import { CONTENT_CACHE_TAG } from '@/features/articles/queries';
import { ApiError, apiFetch } from '@/lib/api/client';
import { interviewApiPath, type InterviewFilters } from './listing-params';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function retrySoon() {
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
}

export interface InterviewPage {
  items: InterviewQuestionSummary[];
  pagination: PaginationMeta;
}

export async function getInterviewPage(filters: InterviewFilters): Promise<InterviewPage | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    const { data, meta } = await apiFetch<
      InterviewQuestionSummary[],
      { pagination: PaginationMeta }
    >(interviewApiPath(filters));
    return { items: data, pagination: meta.pagination };
  } catch {
    retrySoon();
    return null;
  }
}

export async function getInterviewFacets(): Promise<InterviewFacets> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  try {
    return (await apiFetch<InterviewFacets>('/interview-questions/facets')).data;
  } catch {
    retrySoon();
    return { technologies: [], topics: [], interviewCategories: [] };
  }
}

/** Null means it doesn't exist. Other failures throw, so an outage is never cached as a 404. */
export async function getInterviewQuestion(slug: string): Promise<InterviewQuestionDetail | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CONTENT_CACHE_TAG);
  if (!SLUG_PATTERN.test(slug)) return null;
  try {
    return (await apiFetch<InterviewQuestionDetail>(`/interview-questions/${slug}`)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Used at build time only. */
export async function getInterviewSlugs(): Promise<string[]> {
  try {
    return (await apiFetch<string[]>('/interview-questions/slugs')).data;
  } catch {
    return [];
  }
}
