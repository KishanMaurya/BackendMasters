import { Injectable } from '@nestjs/common';
import type {
  AdminCategory,
  AdminTag,
  CategoryInput,
  CategorySlug,
  TagInput,
} from '@backendmasters/shared';
import type { AdminContext } from '../../common/auth/admin.guard.js';
import { databaseFailure, writeFailure } from '../../common/http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';

const TAG_COLUMNS = 'id, slug, name, article_tags(count)';

interface TagRow {
  id: string;
  slug: string;
  name: string;
  article_tags: { count: number }[];
}

function toAdminTag({ article_tags, ...tag }: TagRow): AdminTag {
  return { ...tag, articleCount: article_tags[0]?.count ?? 0 };
}

@Injectable()
export class TaxonomyRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async listCategories(admin: AdminContext): Promise<AdminCategory[]> {
    const { data, error } = await this.client(admin)
      .from('category_summaries')
      .select('id, slug, name, description, sort_order, article_count')
      .order('sort_order');

    if (error) throw databaseFailure('Listing categories for admin', error);
    return data.map((row) => ({
      id: row.id as string,
      slug: row.slug as CategorySlug,
      name: row.name ?? '',
      description: row.description ?? '',
      sortOrder: row.sort_order ?? 0,
      articleCount: row.article_count ?? 0,
    }));
  }

  /** Returns false when no category has this id. */
  async updateCategory(admin: AdminContext, id: string, input: CategoryInput): Promise<boolean> {
    const { data, error } = await this.client(admin)
      .from('categories')
      .update({ name: input.name, description: input.description, sort_order: input.sortOrder })
      .eq('id', id)
      .select('id');

    if (error) throw writeFailure('Updating a category', error);
    return data.length > 0;
  }

  async listTags(admin: AdminContext): Promise<AdminTag[]> {
    const { data, error } = await this.client(admin).from('tags').select(TAG_COLUMNS).order('name');

    if (error) throw databaseFailure('Listing tags for admin', error);
    return (data as unknown as TagRow[]).map(toAdminTag);
  }

  async createTag(admin: AdminContext, input: TagInput): Promise<AdminTag> {
    const { data, error } = await this.client(admin)
      .from('tags')
      .insert(input)
      .select(TAG_COLUMNS)
      .single();

    if (error) throw writeFailure('Creating a tag', error);
    return toAdminTag(data as unknown as TagRow);
  }

  async updateTag(admin: AdminContext, id: string, input: TagInput): Promise<AdminTag | null> {
    const { data, error } = await this.client(admin)
      .from('tags')
      .update(input)
      .eq('id', id)
      .select(TAG_COLUMNS)
      .maybeSingle();

    if (error) throw writeFailure('Updating a tag', error);
    return data ? toAdminTag(data as unknown as TagRow) : null;
  }

  /** Returns false when no tag has this id. Articles keep existing without the tag. */
  async deleteTag(admin: AdminContext, id: string): Promise<boolean> {
    const { data, error } = await this.client(admin)
      .from('tags')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw writeFailure('Deleting a tag', error);
    return data.length > 0;
  }

  private client(admin: AdminContext) {
    return this.supabase.clientForUser(admin.accessToken);
  }
}
