import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, isAuthRetryableFetchError, SupabaseClient } from '@supabase/supabase-js';
import type { DependencyStatus } from '@backendmasters/shared';
import type { Env } from '../config/env.js';
import type { Database } from './database.types.js';

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
  private publicInstance?: SupabaseClient<Database>;
  private adminInstance?: SupabaseClient<Database>;

  constructor(config: ConfigService<Env, true>) {
    this.url = config.get('SUPABASE_URL', { infer: true });
    this.publishableKey = config.get('SUPABASE_PUBLISHABLE_KEY', { infer: true });
    this.secretKey = config.get('SUPABASE_SECRET_KEY', { infer: true });
  }

  get isConfigured(): boolean {
    return Boolean(this.url && this.publishableKey && this.secretKey);
  }

  /** Anonymous access. RLS applies. For public reads. */
  get publicClient(): SupabaseClient<Database> {
    this.publicInstance ??= this.build(this.publishableKey);
    return this.publicInstance;
  }

  /** Bypasses RLS. Only for narrow server jobs such as view counting and storage. */
  get adminClient(): SupabaseClient<Database> {
    this.adminInstance ??= this.build(this.secretKey);
    return this.adminInstance;
  }

  /** Acts as the signed-in user. RLS applies. Created per request. For admin content writes. */
  clientForUser(accessToken: string): SupabaseClient<Database> {
    return this.build(this.publishableKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }

  /**
   * Returns the user id of a valid access token, or null. Tokens are checked against the
   * project's public signing keys, so this normally needs no call to Supabase. An outage
   * throws instead, so it isn't reported to a signed-in admin as a bad token.
   */
  async verifyAccessToken(accessToken: string): Promise<string | null> {
    const { data, error } = await this.publicClient.auth.getClaims(accessToken);
    if (error && isAuthRetryableFetchError(error)) {
      throw new ServiceUnavailableException('Sign-in could not be checked');
    }
    return error ? null : (data?.claims.sub ?? null);
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
  ): SupabaseClient<Database> {
    if (!this.url || !key) {
      throw new ServiceUnavailableException('Supabase is not configured');
    }
    return createClient<Database>(this.url, key, {
      ...options,
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
