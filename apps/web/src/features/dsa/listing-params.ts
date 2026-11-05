import { DSA_TOPIC_SLUGS, type Difficulty, type DsaTopic } from '@backendmasters/shared';

export const PROBLEMS_PER_PAGE = 20;
const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export interface DsaFilters {
  page: number;
  topic?: DsaTopic;
  difficulty?: Difficulty;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Anything unrecognised in the URL is ignored, so a bad link still shows a useful page. */
export function parseDsaFilters(raw: RawParams): DsaFilters {
  const filters: DsaFilters = { page: 1 };

  const page = Number(first(raw.page));
  if (Number.isInteger(page) && page > 0) filters.page = page;

  const topic = first(raw.topic);
  if (DSA_TOPIC_SLUGS.includes(topic as DsaTopic)) filters.topic = topic as DsaTopic;

  const difficulty = first(raw.difficulty);
  if (DIFFICULTIES.includes(difficulty as Difficulty))
    filters.difficulty = difficulty as Difficulty;

  return filters;
}

export function dsaHref(filters: Partial<DsaFilters>): string {
  const params = new URLSearchParams();
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.page && filters.page > 1) params.set('page', String(filters.page));
  const query = params.toString();
  return query ? `/dsa?${query}` : '/dsa';
}

export function dsaApiPath(filters: DsaFilters): string {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(PROBLEMS_PER_PAGE),
  });
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  return `/dsa-problems?${params.toString()}`;
}
