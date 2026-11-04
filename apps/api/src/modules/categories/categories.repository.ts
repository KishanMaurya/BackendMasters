import { Injectable } from '@nestjs/common';
import type { CategorySlug, CategorySummary } from '@backendmasters/shared';
import { databaseFailure } from '../../common/http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<CategorySummary[]> {
    const { data, error } = await this.supabase.publicClient
      .from('category_summaries')
      .select('slug, name, description, article_count')
      .order('sort_order');

    if (error) throw databaseFailure('Listing categories', error);

    return data.map((row) => ({
      slug: row.slug as CategorySlug,
      name: row.name ?? '',
      description: row.description ?? '',
      articleCount: row.article_count ?? 0,
    }));
  }
}
