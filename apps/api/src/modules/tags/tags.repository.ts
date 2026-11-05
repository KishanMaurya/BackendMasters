import { Injectable } from '@nestjs/common';
import type { CategorySlug, TagSummary, TagUsage } from '@backendmasters/shared';
import { databaseFailure } from '../../common/http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';

@Injectable()
export class TagsRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<TagSummary[]> {
    const { data, error } = await this.supabase.publicClient
      .from('tags')
      .select('slug, name')
      .order('name');

    if (error) throw databaseFailure('Listing tags', error);
    return data;
  }

  /** RLS limits this to articles that are published and due. */
  async findUsage(category: CategorySlug): Promise<TagUsage[]> {
    const { data, error } = await this.supabase.publicClient
      .from('article_tags')
      .select('tags!inner(slug), articles!inner(status, categories!inner(slug))')
      .eq('articles.status', 'published')
      .eq('articles.categories.slug', category)
      .limit(1000);

    if (error) throw databaseFailure('Counting tag usage', error);

    const rows = data as unknown as { tags: { slug: string } }[];
    const counts = new Map<string, number>();
    for (const { tags } of rows) counts.set(tags.slug, (counts.get(tags.slug) ?? 0) + 1);
    return [...counts].map(([slug, articleCount]) => ({ slug, articleCount }));
  }
}
