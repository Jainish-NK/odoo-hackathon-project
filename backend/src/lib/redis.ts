import Redis from 'ioredis';

import { redisConfig } from '@/config/redis';
import { logger } from '@/lib/logger';

/**
 * Thin, reusable Redis abstraction. Keep this the single point of contact
 * with ioredis so callers (caching, rate limiting, future background jobs)
 * never import ioredis directly.
 */
class RedisClient {
  private client: Redis;
  private connected = false;

  constructor() {
    this.client = new Redis(redisConfig.url, {
      keyPrefix: redisConfig.keyPrefix,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 2) return null; // stop reconnect spam when redis is not running
        return Math.min(times * 300, 1000);
      },
    });

    this.client.on('connect', () => {
      this.connected = true;
      logger.info('Redis connected');
    });

    this.client.on('error', (err) => {
      this.connected = false;
      logger.warn({ err: err.message }, 'Redis offline, running in degraded cache mode');
    });

    this.client.on('close', () => {
      this.connected = false;
    });
  }

  /** Raw client escape hatch for modules that need Redis-native features (e.g. rate-limit-redis). */
  get raw(): Redis {
    return this.client;
  }

  async connect(): Promise<void> {
    if (this.client.status === 'ready') return;
    try {
      await this.client.connect();
    } catch (err) {
      // ioredis throws synchronously if connect() is called while a connection
      // attempt is already in flight (status transitions through several
      // non-'ready' states — 'connecting', 'connect', 'reconnecting' — that a
      // simple status check can race against). That's not a real failure, so
      // don't let it crash startup; only rethrow genuine connection errors.
      if (err instanceof Error && /already connecting|already connected/i.test(err.message)) {
        return;
      }
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    this.connected = false;
  }

  isHealthy(): boolean {
    return this.connected;
  }

  /**
   * Every cache-facing method below (get/getJson/set/setJson/delete/
   * deleteByPrefix) swallows Redis errors instead of throwing. Caching is
   * an optimization, not a correctness requirement — every caller treats a
   * cache miss as "go to the database," so a Redis outage should degrade
   * to that same path (slower, but working) rather than surfacing as a
   * request-failing exception. `connect()`/`disconnect()` intentionally do
   * NOT swallow errors: those run at startup/shutdown where a real failure
   * should be visible immediately.
   */
  private async safely<T>(operation: string, fallback: T, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      logger.warn({ err, operation }, 'Redis operation failed; degrading gracefully');
      return fallback;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.safely('get', null, () => this.client.get(key));
  }

  async getJson<T>(key: string): Promise<T | null> {
    return this.safely('getJson', null as T | null, async () => {
      const value = await this.client.get(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    });
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await this.safely('set', undefined, async () => {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    });
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds: number = redisConfig.defaultTtlSeconds,
  ): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.safely('delete', undefined, async () => {
      await this.client.del(key);
    });
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    await this.safely('deleteByPrefix', undefined, async () => {
      const stream = this.client.scanStream({
        match: `${redisConfig.keyPrefix}${prefix}*`,
        count: 100,
      });
      const pipeline = this.client.pipeline();
      let hasKeys = false;

      for await (const keys of stream as AsyncIterable<string[]>) {
        for (const key of keys) {
          hasKeys = true;
          // scanStream returns keys including the prefix already applied by ioredis' keyPrefix option,
          // so strip it before calling del (which re-applies the prefix).
          pipeline.del(key.replace(redisConfig.keyPrefix, ''));
        }
      }

      if (hasKeys) await pipeline.exec();
    });
  }
}

export const redisClient = new RedisClient();
