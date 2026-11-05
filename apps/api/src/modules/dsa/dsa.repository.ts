import { Injectable } from '@nestjs/common';
import type { DsaProblemDetail, DsaProblemSummary, DsaTopic } from '@backendmasters/shared';
import { databaseFailure } from '../../common/http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';
import { toDsaDetail, toDsaSummary, type DsaDetailRow } from './dsa.mapper.js';
import type { ListDsaProblemsQuery } from './dto/dsa.dto.js';

const SUMMARY_COLUMNS = 'id, slug, title, topic, difficulty';
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, problem_statement, examples, problem_constraints,
  brute_force_approach, optimized_approach, explanation, time_complexity, space_complexity,
  dry_run, solutions, published_at, updated_at`;

const RANGE_NOT_SATISFIABLE = 'PGRST103';

/** Uses the anonymous client, so RLS limits every result to published problems that are due. */
@Injectable()
export class DsaRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findPublished(
    query: ListDsaProblemsQuery,
  ): Promise<{ items: DsaProblemSummary[]; total: number }> {
    const from = (query.page - 1) * query.pageSize;
    let request = this.supabase.publicClient
      .from('dsa_problems')
      .select(SUMMARY_COLUMNS, { count: 'exact' })
      .eq('status', 'published');

    if (query.topic) request = request.eq('topic', query.topic);
    if (query.difficulty) request = request.eq('difficulty', query.difficulty);

    const { data, count, error } = await request
      .order('title')
      .order('id')
      .range(from, from + query.pageSize - 1);

    if (error?.code === RANGE_NOT_SATISFIABLE) return { items: [], total: count ?? 0 };
    if (error) throw databaseFailure('Listing DSA problems', error);
    return { items: data.map(toDsaSummary), total: count ?? 0 };
  }

  async findBySlug(slug: string): Promise<DsaProblemDetail | null> {
    const { data, error } = await this.supabase.publicClient
      .from('dsa_problems')
      .select(DETAIL_COLUMNS)
      .eq('status', 'published')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw databaseFailure('Reading a DSA problem', error);
    return data ? toDsaDetail(data as unknown as DsaDetailRow) : null;
  }

  async findAllSlugs(): Promise<string[]> {
    const { data, error } = await this.supabase.publicClient
      .from('dsa_problems')
      .select('slug')
      .eq('status', 'published')
      .limit(1000);

    if (error) throw databaseFailure('Listing DSA problem slugs', error);
    return data.map((row) => row.slug);
  }

  async findAllTopics(): Promise<DsaTopic[]> {
    const { data, error } = await this.supabase.publicClient
      .from('dsa_problems')
      .select('topic')
      .eq('status', 'published')
      .limit(1000);

    if (error) throw databaseFailure('Counting DSA topics', error);
    return data.map((row) => row.topic as DsaTopic);
  }
}
