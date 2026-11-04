import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiErrorBody, ApiFailure } from '@backendmasters/shared';
import { buildMeta, RequestWithId } from '../http/request-context.js';

const INTERNAL_ERROR: ApiErrorBody = {
  code: 'INTERNAL_ERROR',
  message: 'Something went wrong. Please try again.',
};

/** Turns every failure into the standard error envelope. Internal details are logged, not returned. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const error = exception instanceof HttpException ? toErrorBody(exception) : INTERNAL_ERROR;

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl.split('?')[0]} failed [${request.id}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiFailure = { error, meta: buildMeta(request) };
    response.status(status).json(body);
  }
}

function toErrorBody(exception: HttpException): ApiErrorBody {
  const status = exception.getStatus();
  const code = HttpStatus[status] ?? 'HTTP_ERROR';
  const payload = exception.getResponse();

  if (typeof payload === 'string') return { code, message: payload };

  const { message } = payload as { message?: string | string[] };
  // ValidationPipe reports a list of problems as an array.
  if (Array.isArray(message)) return { code, message: 'Validation failed', details: message };
  return { code, message: message ?? exception.message };
}
