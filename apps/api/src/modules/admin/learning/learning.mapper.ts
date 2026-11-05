import type {
  AdminDsaProblem,
  AdminInterviewQuestion,
  Difficulty,
  DsaProblemInput,
  DsaTopic,
  InterviewQuestionInput,
} from '@backendmasters/shared';
import type { Json } from '../../../supabase/database.types.js';
import { toDsaBody, type DsaBodyRow } from '../../dsa/dsa.mapper.js';

export const DSA_COLUMNS = `id, slug, title, topic, difficulty, status, published_at, updated_at,
  problem_statement, examples, problem_constraints, brute_force_approach, optimized_approach,
  explanation, time_complexity, space_complexity, dry_run, solutions`;

export const QUESTION_COLUMNS = `id, slug, title, technology, topic, interview_category, difficulty,
  status, published_at, updated_at, short_answer, detailed_explanation, practical_example,
  code_example, code_language, related_question_ids`;

export interface AdminDsaRow extends DsaBodyRow {
  id: string;
  slug: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
}

export interface AdminQuestionRow {
  id: string;
  slug: string;
  title: string;
  technology: string;
  topic: string;
  interview_category: string | null;
  difficulty: Difficulty;
  status: 'draft' | 'published';
  published_at: string | null;
  updated_at: string;
  short_answer: string;
  detailed_explanation: string;
  practical_example: string;
  code_example: string | null;
  code_language: string | null;
  related_question_ids: string[];
}

export function toAdminDsa(row: AdminDsaRow): AdminDsaProblem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    topic: row.topic as DsaTopic,
    difficulty: row.difficulty,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    ...toDsaBody(row),
  };
}

export function toDsaColumns(input: DsaProblemInput) {
  return {
    slug: input.slug,
    title: input.title,
    topic: input.topic,
    difficulty: input.difficulty,
    problem_statement: input.problemStatement,
    examples: input.examples as unknown as NonNullable<Json>,
    problem_constraints: input.constraints,
    brute_force_approach: input.bruteForceApproach,
    optimized_approach: input.optimizedApproach,
    explanation: input.explanation,
    time_complexity: input.timeComplexity,
    space_complexity: input.spaceComplexity,
    dry_run: input.dryRun,
    solutions: input.solutions as unknown as NonNullable<Json>,
  };
}

export function toAdminQuestion(row: AdminQuestionRow): AdminInterviewQuestion {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    technology: row.technology,
    topic: row.topic,
    interviewCategory: row.interview_category,
    difficulty: row.difficulty,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    shortAnswer: row.short_answer,
    detailedExplanation: row.detailed_explanation,
    practicalExample: row.practical_example,
    codeExample: row.code_example,
    codeLanguage: row.code_language,
    relatedQuestionIds: row.related_question_ids,
  };
}

export function toQuestionColumns(input: InterviewQuestionInput) {
  return {
    slug: input.slug,
    title: input.title,
    technology: input.technology,
    topic: input.topic,
    interview_category: input.interviewCategory?.trim() || null,
    difficulty: input.difficulty,
    short_answer: input.shortAnswer,
    detailed_explanation: input.detailedExplanation,
    practical_example: input.practicalExample,
    code_example: input.codeExample?.trim() ? input.codeExample : null,
    code_language: input.codeExample?.trim() ? input.codeLanguage?.trim() || null : null,
    related_question_ids: input.relatedQuestionIds,
  };
}
