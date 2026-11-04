import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiSuccess } from '@backendmasters/shared';
import { buildMeta, RequestWithId } from '../http/request-context.js';

/** Wraps every controller return value in the standard `{ data, meta }` envelope. */
@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<T, ApiSuccess<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T>> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    return next.handle().pipe(map((data) => ({ data, meta: buildMeta(request) })));
  }
}
