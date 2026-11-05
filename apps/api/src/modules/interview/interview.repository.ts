import { Injectable } from '@nestjs/common';
import type {
  InterviewFacets,
  InterviewQuestionDetail,
  InterviewQuestionSummary,
} from '@backendmasters/shared';
import { databaseFailure } from '../../common/http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';
import type { ListInterviewQuestionsQuery } from './dto/interview.dto.js';

const SUMMARY_COLUMNS =
  'id, slug, title, technology, topic, interview_category, difficulty, short_answer';
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, detailed_explanation, practical_example, code_example,
  code_language, related_question_ids, published_at, updated_at`;

const RANGE_NOT_SATISFIABLE = 'PGRST103';

interface SummaryRow {
  id: string;
  slug: string;
  title: string;
  technology: string;
  topic: string;
  interview_category: string | null;
  difficulty: InterviewQuestionSummary['difficulty'];
  short_answer: string;
}

interface DetailRow extends SummaryRow {
  detailed_explanation: string;
  practical_example: string;
  code_example: string | null;
  code_language: string | null;
  related_question_ids: string[];
  published_at: string | null;
  updated_at: string;
}

function toSummary(row: SummaryRow): InterviewQuestionSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    technology: row.technology,
    topic: row.topic,
    interviewCategory: row.interview_category,
    difficulty: row.difficulty,
    shortAnswer: row.short_answer,
  };
}

/** Sorted distinct values, for filter menus. */
export function distinct(values: readonly (string | null)[]): string[] {
  const present = values.filter((value): value is string => Boolean(value));
  return [...new Set(present)].sort((a, b) => a.localeCompare(b));
}

/** Uses the anonymous client, so RLS limits every result to published questions that are due. */
@Injectable()
export class InterviewRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findPublished(
    query: ListInterviewQuestionsQuery,
  ): Promise<{ items: InterviewQuestionSummary[]; total: number }> {
    const from = (query.page - 1) * query.pageSize;
    let request = this.supabase.publicClient
      .from('interview_questions')
      .select(SUMMARY_COLUMNS, { count: 'exact' })
      .eq('status', 'published');

    if (query.q) {
      request = request.textSearch('search', query.q, { type: 'websearch', config: 'english' });
    }
    if (query.technology) request = request.eq('technology', query.technology);
    if (query.topic) request = request.eq('topic', query.topic);
    if (query.difficulty) request = request.eq('difficulty', query.difficulty);
    if (query.interviewCategory) {
      request = request.eq('interview_category', query.interviewCategory);
    }

    const { data, count, error } = await request
      .order('technology')
      .order('title')
      .order('id')
      .range(from, from + query.pageSize - 1);

    if (error?.code === RANGE_NOT_SATISFIABLE) return { items: [], total: count ?? 0 };
    if (error) throw databaseFailure('Listing interview questions', error);
    return { items: data.map(toSummary), total: count ?? 0 };
  }

  async findBySlug(slug: string): Promise<InterviewQuestionDetail | null> {
    const { data, error } = await this.supabase.publicClient
      .from('interview_questions')
      .select(DETAIL_COLUMNS)
      .eq('status', 'published')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw databaseFailure('Reading an interview question', error);
    if (!data) return null;

    const row = data as unknown as DetailRow;
    return {
      ...toSummary(row),
      detailedExplanation: row.detailed_explanation,
      practicalExample: row.practical_example,
      codeExample: row.code_example,
      codeLanguage: row.code_language,
      related: await this.findRelated(row.related_question_ids),
      // Always set on published rows: a database constraint guarantees it.
      publishedAt: row.published_at as string,
      updatedAt: row.updated_at,
    };
  }

  async findAllSlugs(): Promise<string[]> {
    const { data, error } = await this.supabase.publicClient
      .from('interview_questions')
      .select('slug')
      .eq('status', 'published')
      .limit(1000);

    if (error) throw databaseFailure('Listing interview question slugs', error);
    return data.map((row) => row.slug);
  }

  async findFacets(): Promise<InterviewFacets> {
    const { data, error } = await this.supabase.publicClient
      .from('interview_questions')
      .select('technology, topic, interview_category')
      .eq('status', 'published')
      .limit(1000);

    if (error) throw databaseFailure('Reading interview question filters', error);
    return {
      technologies: distinct(data.map((row) => row.technology)),
      topics: distinct(data.map((row) => row.topic)),
      interviewCategories: distinct(data.map((row) => row.interview_category)),
    };
  }

  /** A related question that is a draft is left out by RLS. */
  private async findRelated(ids: string[]): Promise<InterviewQuestionSummary[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.supabase.publicClient
      .from('interview_questions')
      .select(SUMMARY_COLUMNS)
      .eq('status', 'published')
      .in('id', ids)
      .order('title');

    if (error) throw databaseFailure('Reading related questions', error);
    return data.map(toSummary);
  }
}
