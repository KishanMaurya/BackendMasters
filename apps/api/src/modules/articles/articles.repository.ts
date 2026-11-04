import { Injectable } from '@nestjs/common';
import type { ArticleDetail, ArticleSummary } from '@backendmasters/shared';
import { databaseFailure } from '../../common/http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';
import {
  toArticleDetail,
  toArticleSummary,
  type ArticleDetailRow,
  type ArticleSummaryRow,
} from './articles.mapper.js';
import type { ListArticlesQuery } from './dto/list-articles.query.js';

const SUMMARY_COLUMNS = `id, slug, title, description, cover_image_url, reading_time_minutes,
  difficulty, published_at, is_featured, category:categories!inner(slug, name)`;
const TAG_FILTER = ', tag_filter:article_tags!inner(tags!inner(slug))';
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, content, seo_title, seo_description, updated_at,
  author:profiles(display_name, avatar_url), article_tags(tags(slug, name))`;

/** PostgREST's error for a page starting beyond the last row. */
const RANGE_NOT_SATISFIABLE = 'PGRST103';

export interface ArticlePage {
  items: ArticleSummary[];
  total: number;
}

@Injectable()
export class ArticlesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  /** Uses the anonymous client, so RLS limits results to published articles that are due. */
  async findPublished(query: ListArticlesQuery): Promise<ArticlePage> {
    const from = (query.page - 1) * query.pageSize;
    const { data, count, error } = await this.listQuery(query).range(
      from,
      from + query.pageSize - 1,
    );

    if (error?.code === RANGE_NOT_SATISFIABLE) {
      return { items: [], total: await this.countPublished(query) };
    }
    if (error) throw databaseFailure('Listing articles', error);

    // The select string is built at runtime, so its result type can't be inferred.
    const rows = data as unknown as ArticleSummaryRow[];
    return { items: rows.map(toArticleSummary), total: count ?? 0 };
  }

  async findBySlug(slug: string): Promise<ArticleDetail | null> {
    const { data, error } = await this.supabase.publicClient
      .from('articles')
      .select(DETAIL_COLUMNS)
      .eq('status', 'published')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw databaseFailure('Reading an article', error);
    return data ? toArticleDetail(data as unknown as ArticleDetailRow) : null;
  }

  private async countPublished(query: ListArticlesQuery): Promise<number> {
    const { count, error } = await this.listQuery(query);
    if (error) throw databaseFailure('Counting articles', error);
    return count ?? 0;
  }

  private listQuery(query: ListArticlesQuery) {
    const columns: string = query.tag ? SUMMARY_COLUMNS + TAG_FILTER : SUMMARY_COLUMNS;
    let request = this.supabase.publicClient
      .from('articles')
      .select(columns, { count: 'exact' })
      .eq('status', 'published');

    if (query.category) request = request.eq('categories.slug', query.category);
    if (query.tag) request = request.eq('article_tags.tags.slug', query.tag);
    if (query.difficulty) request = request.eq('difficulty', query.difficulty);
    if (query.featured !== undefined) request = request.eq('is_featured', query.featured);

    return request.order('published_at', { ascending: false }).order('id', { ascending: true });
  }
}
