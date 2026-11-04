import type { Request } from 'express';
import type { ResponseMeta } from '@backendmasters/shared';

export const REQUEST_ID_HEADER = 'x-request-id';

export interface RequestWithId extends Request {
  id?: string;
}

export function buildMeta(request: RequestWithId): ResponseMeta {
  return { requestId: request.id ?? 'unknown', timestamp: new Date().toISOString() };
}
