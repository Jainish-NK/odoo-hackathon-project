# GlobeTrotter — Backend

A production-shaped backend for **GlobeTrotter**, a personalized, collaborative
travel-planning platform: users plan multi-city trips, build day-wise itineraries,
track budgets, and optionally share trips publicly for others to browse and copy.

This is a hackathon project, but the backend itself is not a toy — auth, authorization,
validation, transactions, caching, and every listed endpoint are implemented and
covered by integration tests against a real PostgreSQL + Redis, not mocks.

## 1. Architecture

```text
HTTP Request
    ↓
Route            src/modules/<domain>/<domain>.routes.ts     (+ nested *.routes.ts for sub-resources)
    ↓
Middleware       auth (JWT), validation (Zod), rate limiting, error handling
    ↓
Controller       src/modules/<domain>/<domain>.controller.ts  — thin: parse request → call service → respond
    ↓
Service          src/modules/<domain>/<domain>.service.ts     — business rules, ownership checks, transactions
    ↓
Repository       src/modules/<domain>/<domain>.repository.ts  — the only place Prisma is called
    ↓
PostgreSQL (via Prisma)
```

Redis sits alongside as infrastructure, not part of the request-handling chain above:

- **Caching**, read-heavy/low-churn endpoints only: city search, activity search,
  community trip listing/detail, and admin analytics. Every cache read degrades to a
  normal database query on a cache miss *or* a Redis error — Redis is never a hard
  dependency for correctness (see [§10](#10-redis)).
- **Rate limiting** — `express-rate-limit` backed by `rate-limit-redis`, shared across
  backend instances rather than tracked per-process. Fails open (skips limiting rather
  than 500ing the request) if Redis is unreachable.
- **Refresh-token session tracking** — each refresh token's random `jti` is stored in
  Redis so it can be rotated on use and revoked on logout / password reset / account
  deletion, without a database table or ever storing the token itself.
- A single low-level client abstraction (`src/lib/redis.ts`) wraps `ioredis` so no
  other file imports it directly.

```text
User
  ├── Trip                                   (owned; PRIVATE or PUBLIC)
  │    ├── TripStop ── City                  (ordered city legs)
  │    │    └── TripActivity → Activity      (day-wise itinerary, scheduled per stop)
  │    └── Expense                           (optionally tied to a TripStop)
  └── SavedDestination ── City               (wishlist)

Trip.visibility = PUBLIC → browsable via /community/trips and /public/trips/:shareSlug
                          → copyable via POST /trips/:tripId/copy (new, independent trip)
```

### Module layout

```text
src/
├── app.ts                  Express app assembly — no route logic lives here
├── server.ts                Process bootstrap: connect deps, listen, graceful shutdown
├── config/                  env / database / redis configuration surfaces
├── lib/                     prisma client, redis client, jwt, logger, swagger spec
├── middleware/               auth, validation, error handling, rate limiting, 404
├── utils/                    errors, response envelope, pagination, asyncHandler
├── routes/index.ts           composition root: mounts every module under /api/v1
└── modules/
    ├── auth/                 register, login, refresh, logout, forgot/reset password
    ├── users/                profile, saved destinations
    ├── trips/                 trip CRUD, visibility toggle, trip-stop CRUD/reorder
    ├── cities/                city search/browse (Redis-cached)
    ├── activities/            activity catalog (Redis-cached) + trip-activity CRUD/reorder
    ├── itinerary/             day-wise itinerary view + reorder
    ├── budgets/                expenses CRUD + calculated cost breakdown
    ├── community/             public trip browsing, copy-trip, public share-link access
    └── admin/                 admin-only user/trip lists + platform analytics (Redis-cached)
```

Every module owns its own `*.schema.ts` (Zod), `*.repository.ts` (Prisma access only),
`*.service.ts` (business rules), `*.controller.ts` (thin), and `*.routes.ts`. Nested trip
resources (`/trips/:tripId/{stops,activities,itinerary,expenses,budget,copy}`) are each
owned by their own module and composed together in `src/modules/trips/trips.routes.ts`.
Ownership checks are centralized once in `tripsService.getOwnedTrip()` and reused by
every module that touches a trip's sub-resources — that rule is never duplicated.

## 2. Tech stack

Node.js 20 · TypeScript (strict) · Express 4 · PostgreSQL 16 · Prisma 5 · Redis 7
(ioredis) · JWT (`jsonwebtoken`) · Zod · Docker Compose · Jest + Supertest ·
ESLint + Prettier · swagger-jsdoc / swagger-ui-express.

## 3. Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres + Redis) — or your own local Postgres 16 / Redis 7

## 4. Environment variables

Copy `.env.example` to `.env` and fill in real secrets before deploying anywhere shared.

| Variable | Purpose | Default |
|---|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `PORT` | HTTP port the API listens on | `4000` |
| `API_PREFIX` | Version prefix for every route except `/health` | `/api/v1` |
| `CORS_ORIGIN` | Allowed browser origin (`*` disables credentialed CORS — see [§8](#8-security)) | `http://localhost:3000` |
| `DATABASE_URL` | Postgres connection string | — (required) |
| `REDIS_URL` | Redis connection string | — (required) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Signing secrets, min 16 chars | — (required) |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes | `15m` / `7d` |
| `PASSWORD_RESET_TOKEN_EXPIRES_MINUTES` | Reset-token validity window | `30` |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` | General API rate limit | `60000` / `100` |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost | `10` |
| `LOG_LEVEL` | pino log level | `info` |

All variables are validated at startup with Zod (`src/config/env.ts`) — the process
exits immediately with a readable error if anything required is missing or malformed.

## 5. Running with Docker (recommended)

```bash
cp .env.example .env
docker compose up -d --build
```

This starts **Postgres, Redis, and the backend** as three containers on one Docker
network. The backend connects to the other two by their **Docker service names**
(`postgres`, `redis`) — not `localhost` — regardless of what host ports you've mapped
them to; see the `environment:` block in `docker-compose.yml`. Each service has a
healthcheck (`pg_isready`, `redis-cli ping`, and `wget /health` for the backend), and
the backend won't start until Postgres and Redis report healthy.

The backend container runs `npm run dev` (`tsx watch`) with `./src` and `./prisma`
bind-mounted, so code changes reload without rebuilding the image.

Migrations are **not** applied automatically by `docker compose up`. Run once after
the containers are healthy:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed
```

Then the API is live at `http://localhost:4000`, docs at `http://localhost:4000/api-docs`.

## 6. Running locally (without a backend container)

```bash
cp .env.example .env
npm install
docker compose up -d postgres redis   # or point DATABASE_URL/REDIS_URL at your own
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

### Seeded accounts

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@globetrotter.dev` | `Password123!` |
| USER | `traveler@globetrotter.dev` | `Password123!` |
| USER | `sam@globetrotter.dev` | `Password123!` |

The seed gives you, immediately usable for a demo:

- 8 cities, 20 catalog activities across them
- **traveler**: a multi-city **PUBLIC** trip (Paris → Rome) with stops, a multi-day
  itinerary, and expenses; plus a second, single-city **DRAFT/PRIVATE** trip (Tokyo)
- **sam**: a multi-city **PUBLIC** trip (Bali → Bangkok) with its own itinerary and
  expenses, and a saved destination
- Two public trips means `/community/trips` and `?sort=popular` have something
  meaningful to show without any manual setup

The seed is idempotent — `npm run prisma:seed` (or `docker compose exec backend npm
run prisma:seed`) can be re-run safely; it upserts/skips rather than duplicating rows.

## 7. Database & Prisma

```bash
npm run prisma:generate        # regenerate the Prisma client after schema changes
npm run prisma:migrate         # create + apply a new migration in development
npm run prisma:migrate:deploy  # apply existing migrations (CI/production/Docker)
npm run prisma:studio          # visual data browser
npm run prisma:seed            # (re)run prisma/seed.ts — safe to repeat
npm run db:reset               # drop, recreate, migrate, and reseed the dev database
```

`prisma/schema.prisma` uses UUID primary keys, explicit foreign keys with deliberate
`onDelete` behavior — `Cascade` for owned aggregates (`User → Trip → TripStop →
TripActivity`, `Trip → Expense`), `SetNull` for an expense's optional link to a stop
(`Expense.tripStopId`) so deleting a stop never deletes the expense, and `Restrict` for
shared reference data (`TripStop → City`, so a city in use can't be deleted out from
under a trip). Unique constraints: `User.email`, `City(name, country)`,
`SavedDestination(userId, cityId)`, `Trip.shareSlug`, `PasswordResetToken.tokenHash`.
Indexes exist on every foreign key plus the columns search/filter endpoints actually
query (`City.country/region/popularity`, `Activity.category/cost`, `Trip.visibility`,
`Trip(startDate, endDate)`, `Expense.tripStopId`, etc.) — see the schema file for the
full list; none were added speculatively.

Multi-step writes that must be all-or-nothing go through `prisma.$transaction`:
copy-trip (trip + stops + activities), stop reorder, activity reorder, itinerary
reorder, and password reset (password change + burning the reset token together, so a
mid-failure can't leave a token that looks unused).

## 8. Security

- Passwords hashed with `bcryptjs` (`BCRYPT_SALT_ROUNDS`), never stored or logged in
  plaintext. Login checks the password **before** checking whether the account is
  disabled, so a wrong-password guess against a disabled account can't be used to
  learn that the account exists or is disabled.
- Short-lived JWT **access tokens** (`{ sub, email, role }` only — no PII, no secrets)
  and longer-lived **refresh tokens** (`{ sub, jti }`). Each refresh token's `jti` is
  tracked in Redis so it can be rotated on every `/auth/refresh` call and revoked on
  logout, password reset, or account deletion.
- `authenticate()` re-resolves the user from the database on every request (not just
  the JWT payload), so a still-valid token for a deleted or disabled account is
  rejected immediately, with distinct error codes: `TOKEN_MISSING`, `TOKEN_INVALID`,
  `TOKEN_EXPIRED`, `USER_NOT_FOUND`, `ACCOUNT_DISABLED`.
- `authorize(Role.ADMIN)` gates `/api/v1/admin/*`. Ownership (a user may only touch
  **their own** trips/stops/activities/expenses) is enforced in the service layer via
  `tripsService.getOwnedTrip()` — never by trusting a client-supplied id.
- Helmet security headers; CORS only sends `Access-Control-Allow-Credentials` when a
  specific origin is configured (a wildcard + credentials combination is invalid per
  spec and browsers reject it anyway).
- Redis-backed rate limiting, stricter on `/auth/*`; fails open if Redis is down rather
  than 500ing every request.
- `forgot-password` always returns the same response whether or not the email is
  registered. The reset token is currently only logged server-side — wiring a real
  email provider is the one intentionally-left `TODO` in `auth.service.ts`.
- Errors never leak stack traces, database internals, password hashes, JWT secrets, or
  Redis credentials (`src/middleware/error.middleware.ts`); the `Authorization` and
  `Cookie` headers are redacted from all logs (`src/lib/logger.ts`, `pino-http`).
- All Prisma queries are parameterized by the query builder — no raw SQL string
  concatenation anywhere in the codebase.

## 9. Authorization model

| Actor | Can | Cannot |
|---|---|---|
| Anonymous | Browse cities/activities, browse `/community/trips`, view a public trip by id or share link | Read/modify anything private, hit `/admin/*` |
| USER | Full CRUD on their own trips and everything nested under them (stops, activities, itinerary, expenses, budget); copy any public trip (or their own private ones) | Read, modify, or delete another user's private data; hit `/admin/*` |
| ADMIN | Everything a USER can, plus `/admin/users`, `/admin/trips`, `/admin/analytics` | — |

Registration never lets a client choose their own role — every new account is `USER`;
an admin account can only be created directly in the database (see the seed script).

## 10. Redis

Redis is used only where it provides real value, and never as a hard dependency for
anything that can safely run without it:

- **Cache reads/writes never throw.** `src/lib/redis.ts` catches every Redis error
  internally, logs a warning, and degrades to the safe fallback (cache miss on read,
  no-op on write) — a Redis outage slows the affected endpoint back to an uncached
  database query, it doesn't 500 it.
- **Rate limiting fails open** (`passOnStoreError: true`) for the same reason — it's a
  protective layer, not a correctness requirement.
- **What's cached and for how long**: city search/detail and activity search/detail
  (2–5 min TTL, matching low write frequency), admin analytics (60s TTL — it's already
  an aggregate, not real-time), community trip listing (30s TTL only — the
  search/city/sort/page combinations are too open-ended to invalidate precisely, so a
  short bound is the deliberate trade-off), and community trip detail by id or share
  slug (120s TTL, **plus** precise invalidation whenever `trips.service` updates,
  deletes, or changes the visibility of that exact trip).
- **What's never cached**: anything scoped to an authenticated user (their own trips,
  budgets, saved destinations) — those always hit Postgres directly, so there's no risk
  of one user's request serving another user's cached response.
- ioredis is configured with `lazyConnect` + a bounded retry strategy
  (`maxRetriesPerRequest: 3`) so a dead Redis doesn't hang requests indefinitely, and
  connect/error/close events are logged without crashing the process.

## 11. Running tests

```bash
npm test                  # everything
npm run test:unit          # tests/unit — pure functions, no external dependencies
npm run test:integration   # tests/integration — spins up the real Express app
```

Integration tests exercise the real app (`createApp()`) via `supertest` against a
**real PostgreSQL + Redis** — nothing is mocked. `.env.test` (loaded by
`tests/setup.ts`, overriding `.env`) points at a separate `globetrotter_test`
database and a separate Redis logical DB, so tests never touch dev/seed data:

```bash
docker compose up -d postgres redis
DATABASE_URL="postgresql://globetrotter:globetrotter@localhost:5432/globetrotter_test?schema=public" \
  npx prisma migrate deploy
npm test
```

**Coverage**: auth (register/login/refresh/logout/forgot-reset-password, every
`authenticate()` failure mode, disabled-account edge cases), users (profile
CRUD, saved destinations, cross-user isolation, cascade-delete verification), trips
(CRUD, ownership, sort/filter), stops (CRUD, reorder transaction, date-range
validation), trip-activities (add/update/remove, reorder transaction, city/date
validation), itinerary (retrieval, reorder, cross-user rejection), budget/expenses
(CRUD, ownership, a fully deterministic budget calculation including the day-boundary
edge case), cities/activities (search/filter), community (pagination, city/popularity
filters, public-vs-private visibility including the toggle-back regression, share-link
access), copy-trip (ownership, independence from the original, transaction integrity),
and admin (access control on all three endpoints, analytics response shape).

## 12. API documentation

Interactive Swagger UI is served at **`/api-docs`** in non-production environments,
generated from `@openapi` JSDoc comments on every `*.routes.ts` file
(`src/lib/swagger.ts`, glob: `src/modules/**/*.routes.ts`). All auth, users, trips,
stops, cities, activities, trip-activities, itinerary, budget, expenses, community,
and admin endpoints are documented with their parameters, request bodies, response
codes, and auth requirements — a frontend developer should be able to integrate
against the API using `/api-docs` alone.

## 13. API reference

All endpoints are versioned under `API_PREFIX` (`/api/v1` by default). `GET /health`
is intentionally unversioned — it's an infra-level liveness/readiness probe reporting
both database and Redis connectivity.

```text
GET    /health

POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

GET    /api/v1/users/me
PATCH  /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/me/saved-destinations
POST   /api/v1/users/me/saved-destinations/:cityId
DELETE /api/v1/users/me/saved-destinations/:cityId

GET    /api/v1/cities
GET    /api/v1/cities/:cityId

GET    /api/v1/activities
GET    /api/v1/activities/:activityId

POST   /api/v1/trips
GET    /api/v1/trips
GET    /api/v1/trips/:tripId
PATCH  /api/v1/trips/:tripId
DELETE /api/v1/trips/:tripId
PATCH  /api/v1/trips/:tripId/visibility

GET    /api/v1/trips/:tripId/stops
POST   /api/v1/trips/:tripId/stops
PATCH  /api/v1/trips/:tripId/stops/:stopId
DELETE /api/v1/trips/:tripId/stops/:stopId
PATCH  /api/v1/trips/:tripId/stops/reorder

POST   /api/v1/trips/:tripId/activities
PATCH  /api/v1/trips/:tripId/activities/:activityId
DELETE /api/v1/trips/:tripId/activities/:activityId
PATCH  /api/v1/trips/:tripId/activities/reorder

GET    /api/v1/trips/:tripId/itinerary
PATCH  /api/v1/trips/:tripId/itinerary/reorder

GET    /api/v1/trips/:tripId/budget
GET    /api/v1/trips/:tripId/expenses
POST   /api/v1/trips/:tripId/expenses
PATCH  /api/v1/trips/:tripId/expenses/:expenseId
DELETE /api/v1/trips/:tripId/expenses/:expenseId

POST   /api/v1/trips/:tripId/copy

GET    /api/v1/community/trips
GET    /api/v1/community/trips/:tripId
GET    /api/v1/public/trips/:shareSlug

GET    /api/v1/admin/users
GET    /api/v1/admin/trips
GET    /api/v1/admin/analytics
```

Every response uses one consistent envelope:

```jsonc
// success
{ "success": true, "data": { /* ... */ }, "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } }

// error
{ "success": false, "error": { "code": "TRIP_NOT_FOUND", "message": "Trip not found" } }
```

`meta` is present only on paginated list endpoints. HTTP status codes follow one
convention throughout: `200` for reads/updates/deletes, `201` for creates, `400` for
validation errors, `401` for missing/invalid auth, `403` for ownership/role failures,
`404` for missing resources, `409` for conflicts (duplicate email, already-saved
destination), `429` for rate limiting, `500` for unhandled errors.

## 14. Code quality

```bash
npm run typecheck    # tsc --noEmit, strict mode
npm run lint          # ESLint (import ordering, no-unused-vars, no-explicit-any warnings)
npm run lint:fix
npm run format        # Prettier
npm run format:check
```

## 15. What's deliberately not built

No AI itinerary generation, no external travel/geocoding APIs, no payments, no
real email delivery (reset tokens are logged, not emailed), no
Elasticsearch/Kafka/microservices/GraphQL/Kubernetes. "Popular" trip sorting is a
deterministic proxy (copy count via the existing `Trip.copies` self-relation) rather
than a dedicated engagement-tracking system — the code is structured so a real counter
can replace that one mapping later without touching callers.
