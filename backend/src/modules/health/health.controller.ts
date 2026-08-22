import { Request, Response } from 'express';
import { isDatabaseHealthy } from '@/lib/prisma';
import { redisClient } from '@/lib/redis';
import { sendSuccess } from '@/utils/response';

export const healthController = {
  /**
   * Health check endpoint to report service and dependency status
   */
  async getHealth(_req: Request, res: Response): Promise<void> {
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
        timestamp: new Date().toISOString(),
        service: 'globetrotter-backend',
        dependencies: {
          database: databaseHealthy ? 'connected' : 'unavailable',
          redis: redisHealthy ? 'connected' : 'unavailable',
        },
      },
      healthy ? 200 : 503,
    );
  },
};
