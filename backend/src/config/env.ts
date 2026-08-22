import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),

  DATABASE_URL: z
    .string()
    .default('postgresql://globetrotter:globetrotter@localhost:5432/globetrotter?schema=public'),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z
    .string()
    .default('globetrotter_prod_jwt_access_super_secret_key_2026!'),
  JWT_REFRESH_SECRET: z
    .string()
    .default('globetrotter_prod_jwt_refresh_super_secret_key_2026!'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  PASSWORD_RESET_TOKEN_EXPIRES_MINUTES: z.coerce.number().int().positive().default(30),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.warn('⚠️ Environment warning, using default configuration:');
    for (const issue of parsed.error.issues) {
      console.warn(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    // Parse with empty object to produce default values
    return envSchema.parse({});
  }

  return parsed.data;
}

export const env = loadEnv();
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const isDevelopment = env.NODE_ENV === 'development';
