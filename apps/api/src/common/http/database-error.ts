import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

const logger = new Logger('Database');

/** Logs the details and hides them from clients, who only need to know it failed. */
export function databaseFailure(operation: string, error: { code?: string; message: string }) {
  logger.error(`${operation} failed: ${error.code ?? 'unknown'} ${error.message}`);
  return new BadGatewayException('The database request failed');
}

/** For writes, where the person making the change can act on what went wrong. */
export function writeFailure(
  operation: string,
  error: { code?: string; message: string },
): HttpException {
  switch (error.code) {
    case '23505':
      return new ConflictException('That slug is already in use');
    case '23503':
      return new ConflictException('A category or tag it refers to no longer exists');
    case '23514':
      return new BadRequestException('A value is not allowed');
    case '42501':
      return new ForbiddenException('Administrator access is required');
    case 'BM404':
      return new NotFoundException('Article not found');
    case 'BM409':
      return new ConflictException(
        'This article changed since you opened it. Reload it, then make your edits again.',
      );
    default:
      return databaseFailure(operation, error);
  }
}
