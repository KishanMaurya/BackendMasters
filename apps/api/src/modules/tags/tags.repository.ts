import { Injectable } from '@nestjs/common';
import type { TagSummary } from '@backendmasters/shared';
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
}
