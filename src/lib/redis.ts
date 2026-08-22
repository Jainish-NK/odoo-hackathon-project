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
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    this.client.on('connect', () => {
      this.connected = true;
      logger.info('Redis connected');
    });

    this.client.on('error', (err) => {
      this.connected = false;
      logger.error({ err }, 'Redis error');
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
    if (this.client.status === 'ready' || this.client.status === 'connecting') return;
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    this.connected = false;
  }

  isHealthy(): boolean {
    return this.connected;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number = redisConfig.defaultTtlSeconds): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    const stream = this.client.scanStream({ match: `${redisConfig.keyPrefix}${prefix}*`, count: 100 });
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
  }
}

export const redisClient = new RedisClient();
