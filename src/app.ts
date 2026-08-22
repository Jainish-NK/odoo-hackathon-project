import compression from 'compression';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env, isProduction } from '@/config/env';
import { logger } from '@/lib/logger';
import { isDatabaseHealthy } from '@/lib/prisma';
import { redisClient } from '@/lib/redis';
import { swaggerSpec } from '@/lib/swagger';
import { errorMiddleware } from '@/middleware/error.middleware';
import { notFoundMiddleware } from '@/middleware/not-found.middleware';
import { apiRateLimiter } from '@/middleware/rate-limit.middleware';
import apiRoutes from '@/routes';
import { sendSuccess } from '@/utils/response';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: !isProduction,
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    }),
  );

  /**
   * @openapi
   * /health:
   *   get:
   *     summary: Liveness/readiness probe
   *     description: Not versioned — used by orchestrators and uptime checks.
   */
  app.get('/health', async (_req: Request, res: Response) => {
    const [databaseHealthy, redisHealthy] = await Promise.all([
      isDatabaseHealthy(),
      Promise.resolve(redisClient.isHealthy()),
    ]);

    const healthy = databaseHealthy && redisHealthy;

    sendSuccess(
      res,
      {
        status: healthy ? 'ok' : 'degraded',
        uptime: process.uptime(),
        dependencies: {
          database: databaseHealthy ? 'connected' : 'unavailable',
          redis: redisHealthy ? 'connected' : 'unavailable',
        },
      },
      healthy ? 200 : 503,
    );
  });

  if (!isProduction) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(env.API_PREFIX, apiRateLimiter, apiRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
