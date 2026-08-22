import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '@/lib/jwt';
import { ForbiddenError, UnauthorizedError } from '@/utils/errors';

/**
 * Verifies the Bearer JWT on the request and attaches the authenticated
 * user's identity to req.user. Throws UnauthorizedError otherwise.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

/**
 * Best-effort authentication: attaches req.user if a valid token is present,
 * but never throws. Useful for endpoints that behave differently for
 * logged-in vs anonymous users (e.g. public trip view).
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice('Bearer '.length).trim());
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    } catch {
      // ignore invalid token for optional auth
    }
  }

  next();
}

/**
 * Restricts access to the given roles. Must run after authenticate().
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }
    next();
  };
}
