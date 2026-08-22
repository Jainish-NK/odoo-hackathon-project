import compression from 'compression';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env, isProduction } from '@/config/env';
import { logger } from '@/lib/logger';
import { swaggerSpec } from '@/lib/swagger';
import { errorMiddleware } from '@/middleware/error.middleware';
import { notFoundMiddleware } from '@/middleware/not-found.middleware';
import { apiRateLimiter } from '@/middleware/rate-limit.middleware';
import healthRoutes from '@/modules/health/health.routes';
import apiRoutes from '@/routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  // `Access-Control-Allow-Credentials: true` together with a wildcard origin
  // is invalid per the CORS spec and browsers refuse it outright — only
  // send it when a specific origin is actually configured. The API itself
  // never relies on cookies (auth is Bearer-token only), so this only
  // matters for frontends that happen to fetch with credentials: 'include'.
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: env.CORS_ORIGIN !== '*' }));
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

  // Health check routes for orchestrators, proxies, and uptime monitors
  app.use('/health', healthRoutes);
  app.use('/api/health', healthRoutes);

  if (!isProduction) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(env.API_PREFIX, apiRateLimiter, apiRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
