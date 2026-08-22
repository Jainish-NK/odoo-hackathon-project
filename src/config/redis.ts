import { env } from '@/config/env';

export const redisConfig = {
  url: env.REDIS_URL,
  keyPrefix: 'globetrotter:',
  defaultTtlSeconds: 300,
};
