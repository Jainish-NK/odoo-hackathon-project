import path from 'node:path';

import dotenv from 'dotenv';

// Loaded before any test file's module graph (and therefore before
// src/config/env.ts's own `import 'dotenv/config'`) so these values take
// precedence over whatever is in the root .env file.
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Same rationale as server.ts: a dropped Redis/Postgres connection can
// reject a promise outside any test's own try/catch (e.g. a queued
// rate-limiter command). Without this, that one rejection kills the whole
// Jest worker instead of just failing the test that triggered it.
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection in test run:', reason);
});
