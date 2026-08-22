import { createApp } from '@/app';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { connectDatabase, disconnectDatabase } from '@/lib/prisma';
import { redisClient } from '@/lib/redis';

/**
 * A transient Redis or Postgres hiccup (e.g. a command queued by the
 * rate limiter right as a connection drops) can surface as an unhandled
 * rejection outside any request's try/catch. Log and keep serving rather
 * than let an ancillary dependency take the whole API process down.
 */
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
});

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    logger.info('PostgreSQL connected');
  } catch (err) {
    logger.error({ err }, 'PostgreSQL connection failed at startup');
    // Still allow process to boot so health endpoint can report degraded status
  }

  try {
    await redisClient.connect();
  } catch (err) {
    logger.warn({ err }, 'Redis connection failed at startup; running in degraded cache mode');
  }

  const app = createApp();
  const server = app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`GlobeTrotter API listening on port ${env.PORT} (${env.NODE_ENV})`);
    logger.info(`API base path: ${env.API_PREFIX}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await Promise.allSettled([disconnectDatabase(), redisClient.disconnect()]);
      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force-exit if graceful shutdown hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
