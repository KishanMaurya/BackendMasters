import { Injectable } from '@nestjs/common';
import type { HealthStatus } from '@backendmasters/shared';
import { SupabaseService } from '../../supabase/supabase.service.js';
import { APP_VERSION } from '../../version.js';

@Injectable()
export class HealthService {
  constructor(private readonly supabase: SupabaseService) {}

  async getStatus(): Promise<HealthStatus> {
    const supabase = await this.supabase.checkHealth();
    return {
      // Before credentials exist the API is healthy. A configured but unreachable database isn't.
      status: supabase === 'unreachable' ? 'degraded' : 'ok',
      version: APP_VERSION,
      uptimeSeconds: Math.round(process.uptime()),
      dependencies: { supabase },
    };
  }
}
