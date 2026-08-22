import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { TokenExpiredError, verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { asyncHandler } from '@/utils/asyncHandler';
import { ForbiddenError, UnauthorizedError } from '@/utils/errors';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

function extractBearerToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing access token', 'TOKEN_MISSING');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw new UnauthorizedError('Missing access token', 'TOKEN_MISSING');
  }

  return token;
}

/**
 * Verifies the JWT signature/expiry, then re-resolves the user from the
 * database rather than trusting the token payload alone — so a token that's
 * still cryptographically valid is still rejected once the account behind
 * it has been deleted or disabled.
 */
async function resolveAuthenticatedUser(token: string): Promise<AuthenticatedUser> {
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new UnauthorizedError('Access token has expired', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Invalid access token', 'TOKEN_INVALID');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user) {
    throw new UnauthorizedError('User no longer exists', 'USER_NOT_FOUND');
  }
  if (!user.isActive) {
    throw new UnauthorizedError('This account has been disabled', 'ACCOUNT_DISABLED');
  }

  return { id: user.id, email: user.email, role: user.role };
}

/**
 * Extracts and verifies the Bearer JWT, resolves the authenticated user,
 * and attaches it to req.user. Rejects missing, malformed, invalid,
 * expired tokens, and tokens for users that no longer exist or have been
 * disabled — each with a distinct error code.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req);
    req.user = await resolveAuthenticatedUser(token);
    next();
  },
);

/**
 * Best-effort authentication: attaches req.user if a valid token for an
 * existing, active user is present, but never throws. Useful for endpoints
 * that behave differently for logged-in vs anonymous users (e.g. public
 * trip view).
 */
export const optionalAuthenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;

    if (header?.startsWith('Bearer ')) {
      try {
        req.user = await resolveAuthenticatedUser(header.slice('Bearer '.length).trim());
      } catch {
        // ignore invalid/expired token or disabled account for optional auth
      }
    }

    next();
  },
);

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
