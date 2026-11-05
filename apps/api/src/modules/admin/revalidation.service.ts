import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';

const TIMEOUT_MS = 3000;

/** Tells the website its cached content is out of date. */
@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);
  private readonly url?: string;
  private readonly secret?: string;

  constructor(config: ConfigService<Env, true>) {
    this.url = config.get('WEB_REVALIDATE_URL', { infer: true });
    this.secret = config.get('REVALIDATE_SECRET', { infer: true });
  }

  /** Never throws: the content is already saved, and the caller reports a false result. */
  async revalidateContent(): Promise<boolean> {
    if (!this.url || !this.secret) {
      this.logger.warn('Revalidation is not configured, so the site refreshes on its own schedule');
      return false;
    }
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'x-revalidate-secret': this.secret },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) this.logger.error(`Revalidation returned ${response.status}`);
      return response.ok;
    } catch (error) {
      this.logger.error(`Revalidation failed: ${String(error)}`);
      return false;
    }
  }
}
