import { Request, Response } from 'express';

import { sendError } from '@/utils/response';

export function notFoundMiddleware(req: Request, res: Response): void {
  sendError(res, 404, 'ROUTE_NOT_FOUND', `No route matches ${req.method} ${req.originalUrl}`);
}
