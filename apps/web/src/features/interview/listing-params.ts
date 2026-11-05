import type { Difficulty } from '@backendmasters/shared';

export const QUESTIONS_PER_PAGE = 20;
const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];
const MAX_QUERY_LENGTH = 100;
const MAX_FACET_LENGTH = 60;

export interface InterviewFilters {
  page: number;
  q?: string;
  technology?: string;
  topic?: string;
  difficulty?: Difficulty;
  interviewCategory?: string;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function facet(value: string | string[] | undefined): string | undefined {
  const text = first(value)?.trim();
  return text && text.length <= MAX_FACET_LENGTH ? text : undefined;
}

/** Anything unusable in the URL is ignored, so a bad link still shows a useful page. */
export function parseInterviewFilters(raw: RawParams): InterviewFilters {
  const filters: InterviewFilters = { page: 1 };

  const page = Number(first(raw.page));
  if (Number.isInteger(page) && page > 0) filters.page = page;

  const q = first(raw.q)?.trim().slice(0, MAX_QUERY_LENGTH);
  if (q) filters.q = q;

  const technology = facet(raw.technology);
  if (technology) filters.technology = technology;

  const topic = facet(raw.topic);
  if (topic) filters.topic = topic;

  const difficulty = first(raw.difficulty);
  if (DIFFICULTIES.includes(difficulty as Difficulty))
    filters.difficulty = difficulty as Difficulty;

  const interviewCategory = facet(raw.category);
  if (interviewCategory) filters.interviewCategory = interviewCategory;

  return filters;
}

function shared(filters: Partial<InterviewFilters>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.technology) params.set('technology', filters.technology);
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  return params;
}

export function interviewHref(filters: Partial<InterviewFilters>): string {
  const params = shared(filters);
  if (filters.interviewCategory) params.set('category', filters.interviewCategory);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `/interview-questions?${query}` : '/interview-questions';
}

export function interviewApiPath(filters: InterviewFilters): string {
  const params = shared(filters);
  if (filters.interviewCategory) params.set('interviewCategory', filters.interviewCategory);
  params.set('page', String(filters.page));
  params.set('pageSize', String(QUESTIONS_PER_PAGE));
  return `/interview-questions?${params.toString()}`;
}

/** For a one-line preview, where Markdown markers would just be noise. */
export function plainPreview(markdown: string): string {
  return markdown.replace(/[`*_]/g, '');
}
