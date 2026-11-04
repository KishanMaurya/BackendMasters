import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DependencyStatus } from '@backendmasters/shared';
import type { Env } from '../config/env.js';

const HEALTH_TIMEOUT_MS = 2000;

/**
 * The only place Supabase clients are created. Each client carries different privileges.
 * See docs/ARCHITECTURE.md §4 before choosing one.
 */
@Injectable()
export class SupabaseService {
  private readonly url?: string;
  private readonly publishableKey?: string;
  private readonly secretKey?: string;
  private publicInstance?: SupabaseClient;
  private adminInstance?: SupabaseClient;

  constructor(config: ConfigService<Env, true>) {
    this.url = config.get('SUPABASE_URL', { infer: true });
    this.publishableKey = config.get('SUPABASE_PUBLISHABLE_KEY', { infer: true });
    this.secretKey = config.get('SUPABASE_SECRET_KEY', { infer: true });
  }

  get isConfigured(): boolean {
    return Boolean(this.url && this.publishableKey && this.secretKey);
  }

  /** Anonymous access. RLS applies. For public reads. */
  get publicClient(): SupabaseClient {
    this.publicInstance ??= this.build(this.publishableKey);
    return this.publicInstance;
  }

  /** Bypasses RLS. Only for narrow server jobs such as view counting and storage. */
  get adminClient(): SupabaseClient {
    this.adminInstance ??= this.build(this.secretKey);
    return this.adminInstance;
  }

  /** Acts as the signed-in user. RLS applies. Created per request. For admin content writes. */
  clientForUser(accessToken: string): SupabaseClient {
    return this.build(this.publishableKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }

  async checkHealth(): Promise<DependencyStatus> {
    if (!this.isConfigured) return 'not_configured';
    try {
      const response = await fetch(`${this.url}/auth/v1/health`, {
        headers: { apikey: this.publishableKey as string },
        signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
      });
      return response.ok ? 'ok' : 'unreachable';
    } catch {
      return 'unreachable';
    }
  }

  private build(
    key: string | undefined,
    options: { global?: { headers: Record<string, string> } } = {},
  ): SupabaseClient {
    if (!this.url || !key) {
      throw new ServiceUnavailableException('Supabase is not configured');
    }
    return createClient(this.url, key, {
      ...options,
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
