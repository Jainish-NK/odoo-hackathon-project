import { env } from '@/config/env';

/**
 * Database configuration surface. The actual PrismaClient instance lives in
 * `src/lib/prisma.ts` — this module only holds connection metadata that other
 * parts of the app (health checks, logging) may need without importing Prisma.
 */
export const databaseConfig = {
  url: env.DATABASE_URL,
  maskedUrl: maskConnectionString(env.DATABASE_URL),
};

function maskConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '****';
    return parsed.toString();
  } catch {
    return '****';
  }
}
