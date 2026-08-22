import crypto from 'node:crypto';

import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { authRepository } from './auth.repository';
import {
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schema';
import { tokenStore } from './token.store';

import { env } from '@/config/env';
import {
  decodeTokenExpiry,
  JsonWebTokenError,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { ConflictError, UnauthorizedError, ValidationError } from '@/utils/errors';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

/**
 * Issues a fresh access/refresh pair and records the refresh token's `jti`
 * in Redis so it can later be revoked (logout, rotation, password reset)
 * without ever persisting the token itself.
 */
async function issueTokens(user: User): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });

  const exp = decodeTokenExpiry(refreshToken);
  const ttlSeconds = exp ? exp - Math.floor(Date.now() / 1000) : 0;
  await tokenStore.storeRefreshSession(user.id, jti, ttlSeconds);

  return { accessToken, refreshToken };
}

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      name: input.name,
    });

    return { user: toPublicUser(user), tokens: await issueTokens(user) };
  },

  async login(input: LoginInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('This account has been disabled', 'ACCOUNT_DISABLED');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return { user: toPublicUser(user), tokens: await issueTokens(user) };
  },

  /**
   * Rotates the refresh token on every use: the presented token's `jti` is
   * revoked and a brand new access/refresh pair is issued. This limits the
   * blast radius of a leaked refresh token to a single use before it stops
   * working for both the attacker and the legitimate client.
   */
  async refresh(input: RefreshTokenInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    let payload;
    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token', 'TOKEN_INVALID');
    }

    const sessionActive = await tokenStore.isRefreshSessionActive(payload.sub, payload.jti);
    if (!sessionActive) {
      throw new UnauthorizedError(
        'Refresh token has been revoked or already used',
        'TOKEN_REVOKED',
      );
    }

    const user = await authRepository.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User no longer exists', 'USER_NOT_FOUND');
    }
    if (!user.isActive) {
      throw new UnauthorizedError('This account has been disabled', 'ACCOUNT_DISABLED');
    }

    await tokenStore.revokeRefreshSession(payload.sub, payload.jti);

    return { user: toPublicUser(user), tokens: await issueTokens(user) };
  },

  /**
   * Revokes the presented refresh token so it can no longer be used to
   * mint new access tokens. Idempotent and never reveals whether the token
   * was valid, already revoked, or malformed — the end state (revoked) is
   * the same either way.
   */
  async logout(input: LogoutInput): Promise<void> {
    let payload;
    try {
      payload = verifyRefreshToken(input.refreshToken);
    } catch (err) {
      if (err instanceof JsonWebTokenError) return;
      throw err;
    }

    await tokenStore.revokeRefreshSession(payload.sub, payload.jti);
  },

  /**
   * Always resolves successfully regardless of whether the email exists, to
   * avoid leaking which emails are registered. The reset token is only
   * logged here — wiring a real email provider is a follow-up task.
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      logger.info({ email: input.email }, 'Password reset requested for unknown email');
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);

    await authRepository.invalidateAllResetTokensForUser(user.id);
    await authRepository.createPasswordResetToken({ userId: user.id, tokenHash, expiresAt });

    // TODO: send `rawToken` via an email provider instead of logging it.
    logger.info({ userId: user.id, rawToken, expiresAt }, 'Password reset token issued');
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashResetToken(input.token);
    const resetToken = await authRepository.findValidResetTokenByHash(tokenHash);

    if (!resetToken) {
      throw new ValidationError('Reset token is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    await authRepository.updateUserPassword(resetToken.userId, passwordHash);
    await authRepository.markResetTokenUsed(resetToken.id);
    await tokenStore.revokeAllRefreshSessions(resetToken.userId);
  },
};
