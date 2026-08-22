import { Request, Response } from 'express';

import { sendSuccess } from '@/utils/response';

import { authService } from './auth.service';
import { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from './auth.schema';

export const authController = {
  async register(req: Request<unknown, unknown, RegisterInput>, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  },

  async login(req: Request<unknown, unknown, LoginInput>, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 200);
  },

  async forgotPassword(req: Request<unknown, unknown, ForgotPasswordInput>, res: Response): Promise<void> {
    await authService.forgotPassword(req.body);
    sendSuccess(res, { message: 'If an account exists for this email, a reset link has been sent.' });
  },

  async resetPassword(req: Request<unknown, unknown, ResetPasswordInput>, res: Response): Promise<void> {
    await authService.resetPassword(req.body);
    sendSuccess(res, { message: 'Password has been reset successfully.' });
  },
};
