import rateLimit, { Options } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import { env, isTest } from '@/config/env';
import { redisClient } from '@/lib/redis';
import { sendError } from '@/utils/response';

/**
 * Creates a Redis-backed rate limiter so limits are shared across all
 * backend instances rather than tracked per-process in memory. Each
 * limiter gets its own key prefix — sharing one across limiters makes them
 * silently share the same counter, so a stricter limiter stacked behind a
 * looser one (e.g. authRateLimiter behind apiRateLimiter) would never
 * actually enforce its own window.
 */
export function createRateLimiter(name: string, overrides: Partial<Options> = {}) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // ioredis' `call` overloads type their rest args as a fixed tuple, which is
      // fundamentally incompatible with the string[] signature rate-limit-redis
      // requires here — this cast is the documented workaround for that mismatch.
      sendCommand: (...args: string[]) =>
        (redisClient.raw.call as unknown as (...args: string[]) => Promise<never>)(...args),
      prefix: `rl:${name}:`,
    }),
    handler: (_req, res) => {
      sendError(res, 429, 'TOO_MANY_REQUESTS', 'Too many requests, please try again later');
    },
    ...overrides,
  });
}

/** General-purpose limiter applied to the whole API. */
export const apiRateLimiter = createRateLimiter('api');

/**
 * Stricter limiter for auth endpoints (login/register/forgot-password/etc.)
 * to slow brute force. Relaxed in the test environment since the auth
 * integration suite legitimately makes many sequential auth calls from a
 * single IP within one Jest run.
 */
export const authRateLimiter = createRateLimiter('auth', {
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1000 : 20,
});
