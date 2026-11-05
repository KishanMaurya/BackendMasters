import type {
  Difficulty,
  DsaExample,
  DsaProblemDetail,
  DsaProblemSummary,
  DsaSolutions,
  DsaTopic,
} from '@backendmasters/shared';

export interface DsaSummaryRow {
  id: string;
  slug: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
}

/** The columns that describe the problem itself, shared with the admin API. */
export interface DsaBodyRow {
  problem_statement: string;
  examples: unknown;
  problem_constraints: string[];
  brute_force_approach: string;
  optimized_approach: string;
  explanation: string;
  time_complexity: string;
  space_complexity: string;
  dry_run: string;
  solutions: unknown;
}

export interface DsaDetailRow extends DsaSummaryRow, DsaBodyRow {
  published_at: string | null;
  updated_at: string;
}

export function toDsaSummary(row: DsaSummaryRow): DsaProblemSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    topic: row.topic as DsaTopic,
    difficulty: row.difficulty,
  };
}

/** Examples and solutions are JSONB. A missing language reads as empty, rather than failing. */
export function toDsaBody(row: DsaBodyRow) {
  const solutions = (row.solutions ?? {}) as Partial<DsaSolutions>;
  return {
    problemStatement: row.problem_statement,
    examples: (row.examples ?? []) as DsaExample[],
    constraints: row.problem_constraints,
    bruteForceApproach: row.brute_force_approach,
    optimizedApproach: row.optimized_approach,
    explanation: row.explanation,
    timeComplexity: row.time_complexity,
    spaceComplexity: row.space_complexity,
    dryRun: row.dry_run,
    solutions: {
      javascript: solutions.javascript ?? '',
      typescript: solutions.typescript ?? '',
      java: solutions.java ?? '',
      go: solutions.go ?? '',
    },
  };
}

export function toDsaDetail(row: DsaDetailRow): DsaProblemDetail {
  return {
    ...toDsaSummary(row),
    ...toDsaBody(row),
    // Always set on published rows: a database constraint guarantees it.
    publishedAt: row.published_at as string,
    updatedAt: row.updated_at,
  };
}
