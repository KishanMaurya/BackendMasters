import { Injectable } from '@nestjs/common';
import type { AdminArticle, AdminArticleListItem, ArticleInput } from '@backendmasters/shared';
import type { AdminContext } from '../../common/auth/admin.guard.js';
import { databaseFailure, writeFailure } from '../../common/http/database-error.js';
import type { Database } from '../../supabase/database.types.js';
import { SupabaseService } from '../../supabase/supabase.service.js';
import {
  toAdminArticle,
  toAdminListItem,
  type AdminArticleListRow,
  type AdminArticleRow,
} from './admin-articles.mapper.js';
import type { ListAdminArticlesQuery } from './dto/article-input.dto.js';

const LIST_COLUMNS = `id, slug, title, status, is_featured, published_at, updated_at,
  reading_time_minutes, category:categories!inner(id, slug, name)`;
const DETAIL_COLUMNS = `${LIST_COLUMNS}, description, content, cover_image_url, difficulty,
  seo_title, seo_description, article_tags(tag_id)`;

const RANGE_NOT_SATISFIABLE = 'PGRST103';

type SaveArticleArgs = Database['public']['Functions']['save_article']['Args'];

export interface SaveArticleCommand extends ArticleInput {
  id: string | null;
  expectedUpdatedAt: string | null;
  readingTimeMinutes: number;
}

/** Every query runs as the signed-in administrator, so RLS applies to all of them. */
@Injectable()
export class AdminArticlesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async list(
    admin: AdminContext,
    query: ListAdminArticlesQuery,
  ): Promise<{ items: AdminArticleListItem[]; total: number }> {
    const from = (query.page - 1) * query.pageSize;
    let request = this.client(admin)
      .from('articles')
      .select(LIST_COLUMNS, { count: 'exact' })
      .order('updated_at', { ascending: false })
      .order('id')
      .range(from, from + query.pageSize - 1);

    const now = new Date().toISOString();
    if (query.state === 'draft') request = request.eq('status', 'draft');
    if (query.state === 'published') {
      request = request.eq('status', 'published').lte('published_at', now);
    }
    if (query.state === 'scheduled') {
      request = request.eq('status', 'published').gt('published_at', now);
    }
    if (query.category) request = request.eq('category.slug', query.category);
    if (query.q) request = request.ilike('title', `%${escapeLike(query.q)}%`);

    const { data, count, error } = await request;
    if (error?.code === RANGE_NOT_SATISFIABLE) return { items: [], total: count ?? 0 };
    if (error) throw databaseFailure('Listing articles for admin', error);

    const rows = data as unknown as AdminArticleListRow[];
    return { items: rows.map(toAdminListItem), total: count ?? 0 };
  }

  async findById(admin: AdminContext, id: string): Promise<AdminArticle | null> {
    const { data, error } = await this.client(admin)
      .from('articles')
      .select(DETAIL_COLUMNS)
      .eq('id', id)
      .maybeSingle();

    if (error) throw databaseFailure('Reading an article for admin', error);
    return data ? toAdminArticle(data as unknown as AdminArticleRow) : null;
  }

  async save(admin: AdminContext, command: SaveArticleCommand): Promise<string> {
    const args = {
      p_id: command.id,
      p_expected_updated_at: command.expectedUpdatedAt,
      p_slug: command.slug,
      p_title: command.title,
      p_description: command.description,
      p_content: command.content,
      p_cover_image_url: command.coverImageUrl,
      p_category_id: command.categoryId,
      p_reading_time_minutes: command.readingTimeMinutes,
      p_difficulty: command.difficulty,
      p_seo_title: command.seoTitle,
      p_seo_description: command.seoDescription,
      p_is_featured: command.isFeatured,
      p_tag_ids: command.tagIds,
    };
    // Generated types mark every function argument non-null, though several accept null.
    const { data, error } = await this.client(admin).rpc(
      'save_article',
      args as unknown as SaveArticleArgs,
    );

    if (error) throw writeFailure('Saving an article', error);
    return data;
  }

  /** Returns false when no article has this id. */
  async setStatus(
    admin: AdminContext,
    id: string,
    change: { status: 'draft' } | { status: 'published'; publishedAt: string | null },
  ): Promise<boolean> {
    const values =
      change.status === 'published'
        ? { status: change.status, published_at: change.publishedAt }
        : { status: change.status };
    const { data, error } = await this.client(admin)
      .from('articles')
      .update(values)
      .eq('id', id)
      .select('id');

    if (error) throw writeFailure('Changing article status', error);
    return data.length > 0;
  }

  /** Returns false when no article has this id. */
  async delete(admin: AdminContext, id: string): Promise<boolean> {
    const { data, error } = await this.client(admin)
      .from('articles')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw writeFailure('Deleting an article', error);
    return data.length > 0;
  }

  private client(admin: AdminContext) {
    return this.supabase.clientForUser(admin.accessToken);
  }
}

/** Stops % and _ in a search from acting as wildcards. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
