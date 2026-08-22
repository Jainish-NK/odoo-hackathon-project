import { Request, Response } from 'express';

import {
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schema';
import { authService } from './auth.service';

import { sendSuccess } from '@/utils/response';

export const authController = {
  async register(req: Request<unknown, unknown, RegisterInput>, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  },

  async login(req: Request<unknown, unknown, LoginInput>, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 200);
  },

  async refresh(req: Request<unknown, unknown, RefreshTokenInput>, res: Response): Promise<void> {
    const result = await authService.refresh(req.body);
    sendSuccess(res, result, 200);
  },

  async logout(req: Request<unknown, unknown, LogoutInput>, res: Response): Promise<void> {
    await authService.logout(req.body);
    sendSuccess(res, { message: 'Logged out successfully' });
  },

  async forgotPassword(
    req: Request<unknown, unknown, ForgotPasswordInput>,
    res: Response,
  ): Promise<void> {
    await authService.forgotPassword(req.body);
    sendSuccess(res, {
      message: 'If an account exists for this email, a reset link has been sent.',
    });
  },

  async resetPassword(
    req: Request<unknown, unknown, ResetPasswordInput>,
    res: Response,
  ): Promise<void> {
    await authService.resetPassword(req.body);
    sendSuccess(res, { message: 'Password has been reset successfully.' });
  },
};
