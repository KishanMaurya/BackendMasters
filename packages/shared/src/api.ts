/** Response contract shared by the API and its clients. See docs/ARCHITECTURE.md §5. */

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiSuccess<T, M extends object = object> {
  data: T;
  meta: ResponseMeta & M;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiFailure {
  error: ApiErrorBody;
  meta: ResponseMeta;
}

export type ApiResponse<T, M extends object = object> = ApiSuccess<T, M> | ApiFailure;

export type DependencyStatus = 'ok' | 'not_configured' | 'unreachable';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  version: string;
  uptimeSeconds: number;
  dependencies: {
    supabase: DependencyStatus;
  };
}
