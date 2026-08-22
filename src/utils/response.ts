import { Response } from 'express';

export interface SuccessResponseBody<T> {
  success: true;
  data: T;
  meta?: object;
}

export interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: object,
): Response<SuccessResponseBody<T>> {
  const body: SuccessResponseBody<T> = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response<ErrorResponseBody> {
  return res.status(statusCode).json({ success: false, error: { code, message, details } });
}
