import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { isProduction } from '@/config/env';
import { logger } from '@/lib/logger';
import { AppError } from '@/utils/errors';
import { sendError } from '@/utils/response';

/**
 * Centralized error handler. Must be registered last, after all routes.
 * Never leaks stack traces, database internals, password hashes, or secrets.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.path, method: req.method }, err.message);
    }
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(err);
    if (mapped.statusCode >= 500) {
      logger.error({ err, path: req.path, method: req.method }, 'Unmapped Prisma error');
    }
    sendError(res, mapped.statusCode, mapped.code, mapped.message);
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  sendError(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    isProduction ? 'Something went wrong' : err instanceof Error ? err.message : 'Unknown error',
  );
}

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  code: string;
  message: string;
} {
  switch (err.code) {
    case 'P2002':
      return { statusCode: 409, code: 'UNIQUE_CONSTRAINT_VIOLATION', message: 'A record with these values already exists' };
    case 'P2025':
      return { statusCode: 404, code: 'RECORD_NOT_FOUND', message: 'The requested record was not found' };
    case 'P2003':
      return { statusCode: 409, code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION', message: 'Related record does not exist' };
    default:
      return { statusCode: 500, code: 'DATABASE_ERROR', message: 'A database error occurred' };
  }
}
