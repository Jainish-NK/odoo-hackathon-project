import { redisClient } from '@/lib/redis';

/**
 * Tracks which refresh token `jti`s are currently valid, keyed by user, so a
 * refresh token can be revoked (logout, password reset, rotation on use)
 * without needing a database table or storing the token itself — only its
 * random id ever touches Redis.
 */
const REFRESH_SESSION_PREFIX = 'refresh';

function sessionKey(userId: string, jti: string): string {
  return `${REFRESH_SESSION_PREFIX}:${userId}:${jti}`;
}

export const tokenStore = {
  async storeRefreshSession(userId: string, jti: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return;
    await redisClient.set(sessionKey(userId, jti), '1', ttlSeconds);
  },

  async isRefreshSessionActive(userId: string, jti: string): Promise<boolean> {
    const value = await redisClient.get(sessionKey(userId, jti));
    return value !== null;
  },

  async revokeRefreshSession(userId: string, jti: string): Promise<void> {
    await redisClient.delete(sessionKey(userId, jti));
  },

  /** Invalidates every refresh token issued to this user (e.g. after a password reset). */
  async revokeAllRefreshSessions(userId: string): Promise<void> {
    await redisClient.deleteByPrefix(`${REFRESH_SESSION_PREFIX}:${userId}:`);
  },
};
