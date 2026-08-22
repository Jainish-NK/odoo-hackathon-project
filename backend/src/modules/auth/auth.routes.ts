import { Router } from 'express';

import { authController } from './auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema';

import { authRateLimiter } from '@/middleware/rate-limit.middleware';
import { validate } from '@/middleware/validation.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();

router.use(authRateLimiter);

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8, maxLength: 72 }
 *               name: { type: string }
 *     responses:
 *       201: { description: "{ user, tokens: { accessToken, refreshToken } }" }
 *       400: { description: Validation error }
 *       409: { description: An account with this email already exists }
 */
router.post('/register', validate({ body: registerSchema }), asyncHandler(authController.register));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: "{ user, tokens: { accessToken, refreshToken } }" }
 *       401: { description: Invalid credentials, or the account has been disabled (code ACCOUNT_DISABLED) }
 */
router.post('/login', validate({ body: loginSchema }), asyncHandler(authController.login));

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a valid refresh token for a new access/refresh pair (rotates the token)
 *     description: >
 *       The presented refresh token is revoked as part of this call — it can
 *       only ever be used once. Reusing an already-rotated or logged-out
 *       token returns 401 with code TOKEN_REVOKED.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties: { refreshToken: { type: string } }
 *     responses:
 *       200: { description: "{ user, tokens: { accessToken, refreshToken } } — a brand new pair" }
 *       401: { description: Token missing, invalid, expired, revoked, or belongs to a deleted/disabled account }
 */
router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  asyncHandler(authController.refresh),
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke a refresh token, ending that session
 *     description: Idempotent — an already-invalid or unknown token still returns 200.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties: { refreshToken: { type: string } }
 *     responses:
 *       200: { description: Logged out (or already was) }
 */
router.post('/logout', validate({ body: logoutSchema }), asyncHandler(authController.logout));

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset token
 *     description: >
 *       Always responds 200 regardless of whether the email is registered,
 *       to avoid leaking account existence. The reset token itself is
 *       currently only logged server-side (no email provider wired up yet).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties: { email: { type: string, format: email } }
 *     responses:
 *       200: { description: Generic confirmation message }
 */
router.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword),
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using a valid reset token
 *     description: >
 *       On success, every refresh session for the user is revoked — resetting
 *       a password logs out all other devices/sessions.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string, minLength: 8, maxLength: 72 }
 *     responses:
 *       200: { description: Password reset }
 *       400: { description: Reset token is invalid, already used, or expired }
 */
router.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword),
);

export default router;
