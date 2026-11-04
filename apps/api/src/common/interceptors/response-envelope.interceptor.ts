import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiSuccess } from '@backendmasters/shared';
import { Paginated } from '../http/paginated.js';
import { buildMeta, RequestWithId } from '../http/request-context.js';

/** Wraps every controller return value in the standard `{ data, meta }` envelope. */
@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<T, ApiSuccess<unknown>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<unknown>> {
    const request = context.switchToHttp().getRequest<RequestWithId>();
    return next.handle().pipe(
      map((result) =>
        result instanceof Paginated
          ? {
              data: result.items as unknown,
              meta: { ...buildMeta(request), pagination: result.pagination },
            }
          : { data: result, meta: buildMeta(request) },
      ),
    );
  }
}
