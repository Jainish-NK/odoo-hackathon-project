import { Router } from 'express';
import { healthController } from './health.controller';

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Service health & dependency status check
 *     description: Liveness/readiness probe used by uptime checks, load balancers, and orchestrators.
 *     responses:
 *       200:
 *         description: All dependencies healthy
 *       503:
 *         description: Degraded dependency status
 */
const router = Router();

router.get('/', healthController.getHealth);

export default router;
