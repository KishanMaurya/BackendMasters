import { Injectable } from '@nestjs/common';
import type { AdminIdentity, DashboardStats } from '@backendmasters/shared';
import type { AdminContext } from '../../common/auth/admin.guard.js';
import { databaseFailure } from '../../common/http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';
import { AdminArticlesRepository } from './admin-articles.repository.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_LIMIT = 5;

interface CountResult {
  count: number | null;
  error: { code?: string; message: string } | null;
}

@Injectable()
export class DashboardRepository {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly articles: AdminArticlesRepository,
  ) {}

  async findIdentity(admin: AdminContext): Promise<AdminIdentity> {
    const { data, error } = await this.supabase
      .clientForUser(admin.accessToken)
      .from('profiles')
      .select('id, display_name')
      .eq('id', admin.id)
      .single();

    if (error) throw databaseFailure('Reading the admin profile', error);
    return { id: data.id, displayName: data.display_name };
  }

  async getStats(admin: AdminContext): Promise<DashboardStats> {
    const client = this.supabase.clientForUser(admin.accessToken);
    const now = new Date();
    const nowIso = now.toISOString();
    const monthAgo = new Date(now.getTime() - 30 * DAY_MS).toISOString();
    const articles = () => client.from('articles').select('id', { count: 'exact', head: true });
    const views = () => client.from('article_views').select('id', { count: 'exact', head: true });

    const [
      published,
      scheduled,
      drafts,
      featured,
      total,
      last30Days,
      categories,
      tags,
      dsaProblems,
      interviewQuestions,
      recent,
    ] = await Promise.all([
      articles().eq('status', 'published').lte('published_at', nowIso),
      articles().eq('status', 'published').gt('published_at', nowIso),
      articles().eq('status', 'draft'),
      articles().eq('status', 'published').eq('is_featured', true),
      views(),
      views().gte('viewed_at', monthAgo),
      client.from('categories').select('id', { count: 'exact', head: true }),
      client.from('tags').select('id', { count: 'exact', head: true }),
      client.from('dsa_problems').select('id', { count: 'exact', head: true }),
      client.from('interview_questions').select('id', { count: 'exact', head: true }),
      this.articles.list(admin, { page: 1, pageSize: RECENT_LIMIT }),
    ]);

    return {
      articles: {
        published: countOf(published),
        scheduled: countOf(scheduled),
        drafts: countOf(drafts),
        featured: countOf(featured),
      },
      views: { total: countOf(total), last30Days: countOf(last30Days) },
      categories: countOf(categories),
      tags: countOf(tags),
      dsaProblems: countOf(dsaProblems),
      interviewQuestions: countOf(interviewQuestions),
      recent: recent.items,
    };
  }
}

function countOf({ count, error }: CountResult): number {
  if (error) throw databaseFailure('Counting for the dashboard', error);
  return count ?? 0;
}
