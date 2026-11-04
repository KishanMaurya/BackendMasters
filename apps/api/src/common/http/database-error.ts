import { BadGatewayException, Logger } from '@nestjs/common';

const logger = new Logger('Database');

/** Logs the details and hides them from clients, who only need to know it failed. */
export function databaseFailure(operation: string, error: { code?: string; message: string }) {
  logger.error(`${operation} failed: ${error.code ?? 'unknown'} ${error.message}`);
  return new BadGatewayException('The database request failed');
}
