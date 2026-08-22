import crypto from 'node:crypto';

import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { env } from '@/config/env';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';
import { ConflictError, UnauthorizedError, ValidationError } from '@/utils/errors';

import { authRepository } from './auth.repository';
import { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from './auth.schema';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function issueTokens(user: User): AuthTokens {
  return {
    accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
    refreshToken: signRefreshToken({ sub: user.id }),
  };
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

    return { user: toPublicUser(user), tokens: issueTokens(user) };
  },

  async login(input: LoginInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return { user: toPublicUser(user), tokens: issueTokens(user) };
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
  },
};
