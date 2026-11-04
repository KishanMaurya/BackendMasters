import type { HealthStatus } from '@backendmasters/shared';
import { apiFetch } from './client';

export async function getHealth(): Promise<HealthStatus | null> {
  try {
    const { data } = await apiFetch<HealthStatus>('/health', {
      signal: AbortSignal.timeout(3000),
    });
    return data;
  } catch {
    return null;
  }
}
