import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service.js';
import { RevalidationService } from './revalidation.service.js';

const CHECK_EVERY_MS = 60_000;

/**
 * A scheduled article goes live by the clock, with no save to trigger a refresh, so the site's
 * cache has to be told. This checks once a minute for articles that have just come due.
 * RLS only shows articles that are due, so the anonymous client is enough.
 */
@Injectable()
export class ScheduledContentService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScheduledContentService.name);
  private timer?: NodeJS.Timeout;
  private lastCheck = new Date();

  constructor(
    private readonly supabase: SupabaseService,
    private readonly revalidation: RevalidationService,
  ) {}

  onModuleInit(): void {
    if (!this.supabase.isConfigured) return;
    this.timer = setInterval(() => void this.check(), CHECK_EVERY_MS);
    // Never keeps the process alive by itself.
    this.timer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  /** Only moves its window forward once the site has been told, so a failure is retried. */
  async check(now = new Date()): Promise<void> {
    const { count, error } = await this.supabase.publicClient
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gt('published_at', this.lastCheck.toISOString())
      .lte('published_at', now.toISOString());

    if (error) {
      this.logger.error(`Checking scheduled articles failed: ${error.message}`);
      return;
    }
    if (count && !(await this.revalidation.revalidateContent())) return;
    this.lastCheck = now;
  }
}
