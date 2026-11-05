import { Injectable } from '@nestjs/common';
import type {
  CategorySlug,
  ContentKind,
  Difficulty,
  SearchResult,
  SearchSuggestion,
  SitemapEntry,
} from '@backendmasters/shared';
import { databaseFailure } from '../../common/http/database-error.js';
import type { Database } from '../../supabase/database.types.js';
import { SupabaseService } from '../../supabase/supabase.service.js';
import type { SearchQuery } from './dto/search.dto.js';

const DESCRIPTION_LENGTH = 200;
/** PostgREST returns at most this many rows per request. */
const MAX_ROWS = 1000;

type SearchArgs = Database['public']['Functions']['search_content']['Args'];

interface SearchRow {
  kind: string;
  slug: string;
  title: string;
  description: string;
  category_slug: string;
  category_name: string;
  difficulty: Difficulty | null;
  total: number;
}

/** Answers and statements are Markdown. A listing needs a short line of plain text. */
export function toPlainExcerpt(markdown: string, length = DESCRIPTION_LENGTH): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_#>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

/** Uses the anonymous client, so RLS limits every result to published content that is due. */
@Injectable()
export class SearchRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async search(query: SearchQuery): Promise<{ items: SearchResult[]; total: number }> {
    const args = {
      p_query: query.q,
      p_limit: query.pageSize,
      p_offset: (query.page - 1) * query.pageSize,
      ...(query.category ? { p_category: query.category } : {}),
      ...(query.tag ? { p_tag: query.tag } : {}),
    };
    const { data, error } = await this.supabase.publicClient.rpc(
      'search_content',
      args as SearchArgs,
    );

    if (error) throw databaseFailure('Searching content', error);
    const rows = data as unknown as SearchRow[];
    return {
      items: rows.map((row) => ({
        kind: row.kind as ContentKind,
        slug: row.slug,
        title: row.title,
        description: toPlainExcerpt(row.description),
        categorySlug: row.category_slug as CategorySlug,
        categoryName: row.category_name,
        difficulty: row.difficulty,
      })),
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async suggest(query: string): Promise<SearchSuggestion[]> {
    const { data, error } = await this.supabase.publicClient.rpc('search_suggestions', {
      p_query: query,
    });

    if (error) throw databaseFailure('Finding search suggestions', error);
    return data.map((row) => ({
      kind: row.kind as ContentKind,
      slug: row.slug,
      title: row.title,
    }));
  }

  async findSitemapEntries(): Promise<SitemapEntry[]> {
    const client = this.supabase.publicClient;
    const [articles, problems, questions] = await Promise.all([
      client.from('articles').select('slug, updated_at').eq('status', 'published').limit(MAX_ROWS),
      client
        .from('dsa_problems')
        .select('slug, updated_at')
        .eq('status', 'published')
        .limit(MAX_ROWS),
      client
        .from('interview_questions')
        .select('slug, updated_at')
        .eq('status', 'published')
        .limit(MAX_ROWS),
    ]);

    const failed = articles.error ?? problems.error ?? questions.error;
    if (failed) throw databaseFailure('Listing content for the sitemap', failed);

    const entries = (kind: ContentKind, rows: { slug: string; updated_at: string }[] | null) =>
      (rows ?? []).map((row) => ({ kind, slug: row.slug, updatedAt: row.updated_at }));
    return [
      ...entries('article', articles.data),
      ...entries('problem', problems.data),
      ...entries('question', questions.data),
    ];
  }
}
