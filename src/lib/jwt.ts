import { Role } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '@/config/env';

/**
 * Access token payload intentionally carries only what's needed to identify
 * and authorize the caller — no PII beyond email, no phone/name/etc.
 */
export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

/**
 * Refresh tokens carry a random `jti` (not derived from anything guessable)
 * so a single issued token can be looked up and revoked server-side
 * (rotation on refresh, invalidation on logout/password reset) without
 * storing the token itself anywhere.
 */
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export interface DecodedToken {
  exp?: number;
  iat?: number;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

/**
 * Reads the `exp` claim off an already-signed token without verifying its
 * signature — used only to size the Redis TTL for the refresh session
 * record, never to make a trust decision.
 */
export function decodeTokenExpiry(token: string): number | undefined {
  const decoded = jwt.decode(token) as DecodedToken | null;
  return decoded?.exp;
}

export { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
