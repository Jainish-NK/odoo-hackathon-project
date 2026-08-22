import { User } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export const authRepository = {
  findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data: { email: string; passwordHash: string; name: string }): Promise<User> {
    return prisma.user.create({ data });
  },

  updateUserPassword(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  /**
   * Changing the password and burning the reset token must succeed or fail
   * together — if the token update were a separate unguarded call and it
   * failed after the password write succeeded, the token would still look
   * "unused" and could be replayed to reset the password again.
   */
  resetPasswordWithToken(
    userId: string,
    passwordHash: string,
    resetTokenId: string,
  ): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      await tx.passwordResetToken.update({
        where: { id: resetTokenId },
        data: { usedAt: new Date() },
      });
      return user;
    });
  },

  createPasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({ data });
  },

  findValidResetTokenByHash(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
  },

  invalidateAllResetTokensForUser(userId: string) {
    return prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },
};
