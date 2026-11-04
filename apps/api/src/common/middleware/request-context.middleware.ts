import { randomUUID } from 'node:crypto';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { REQUEST_ID_HEADER, RequestWithId } from '../http/request-context.js';

const SAFE_REQUEST_ID = /^[\w-]{1,64}$/;

/** Assigns a request ID and logs each completed request. */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const incoming = request.header(REQUEST_ID_HEADER);
    // A caller-supplied ID ends up in logs, so anything unusual is replaced.
    request.id = incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
    response.setHeader(REQUEST_ID_HEADER, request.id);

    const startedAt = performance.now();
    response.on('finish', () => {
      const durationMs = Math.round(performance.now() - startedAt);
      // Path only: query strings may hold data that shouldn't sit in logs.
      const path = request.originalUrl.split('?')[0];
      this.logger.log(
        `${request.method} ${path} ${response.statusCode} ${durationMs}ms [${request.id}]`,
      );
    });

    next();
  }
}
