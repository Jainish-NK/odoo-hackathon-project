import rateLimit, { Options } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import { env } from '@/config/env';
import { redisClient } from '@/lib/redis';
import { sendError } from '@/utils/response';

/**
 * Creates a Redis-backed rate limiter so limits are shared across all
 * backend instances rather than tracked per-process in memory.
 */
export function createRateLimiter(overrides: Partial<Options> = {}) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.raw.call(...args) as Promise<never>,
      prefix: 'rl:',
    }),
    handler: (_req, res) => {
      sendError(res, 429, 'TOO_MANY_REQUESTS', 'Too many requests, please try again later');
    },
    ...overrides,
  });
}

/** General-purpose limiter applied to the whole API. */
export const apiRateLimiter = createRateLimiter();

/** Stricter limiter for auth endpoints (login/register/forgot-password) to slow brute force. */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
});
