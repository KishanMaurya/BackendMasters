import type { ApiFailure, ApiSuccess } from '@backendmasters/shared';
import { env } from '@/lib/env';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** The single HTTP entry point to the BackendMasters API. Feature code calls this, never fetch(). */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiSuccess<T>> {
  const response = await fetch(`${env.API_URL}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });

  const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;

  if (!response.ok || body === null || 'error' in body) {
    const failure = body !== null && 'error' in body ? body.error : undefined;
    throw new ApiError(
      response.status,
      failure?.code ?? 'INVALID_RESPONSE',
      failure?.message ?? `Unexpected response from ${path}`,
      failure?.details,
    );
  }

  return body;
}
