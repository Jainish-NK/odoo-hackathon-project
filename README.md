# GlobeTrotter — Backend Skeleton

A production-oriented backend foundation for **GlobeTrotter**, a personalized, collaborative
travel-planning platform. This is a hackathon **skeleton**: the domain model, layering,
auth, and every listed endpoint exist and work end-to-end, but business rules (pricing
engines, recommendations, etc.) are intentionally kept minimal so the team can extend them
quickly.

## 1. Architecture

```text
HTTP Request
    ↓
Route            (src/modules/<domain>/<domain>.routes.ts)
    ↓
Middleware       (auth, validation, rate limiting)
    ↓
Controller       (src/modules/<domain>/<domain>.controller.ts) — thin, no business logic
    ↓
Service          (src/modules/<domain>/<domain>.service.ts)   — business rules, ownership checks
    ↓
Repository       (src/modules/<domain>/<domain>.repository.ts) — the only place Prisma is called
    ↓
PostgreSQL (via Prisma)
```

Redis sits alongside as infrastructure, not part of the request-handling chain above:

- **Caching** for read-heavy, low-churn endpoints (city search, activity search, admin
  analytics) — see `citiesService`, `adminService`.
- **Rate limiting** — `express-rate-limit` backed by `rate-limit-redis` so limits are shared
  across all backend instances, not per-process.
- A reusable low-level client abstraction (`src/lib/redis.ts`) exposing
  `connect/disconnect/get/set/delete` so new use cases (sessions, background jobs) don't need
  to touch `ioredis` directly.

The backend is organized around **domain entities** (User, Trip, City, TripStop, Activity,
TripActivity, Expense), not frontend screens — see `prisma/schema.prisma` for the full
relational model and its foreign keys/constraints/indexes.

```text
User
  └── Trip
       ├── TripStop ── City
       ├── TripStop → TripActivity → Activity   (day-wise itinerary)
       └── Expense                              (budget/cost breakdown)

Trip.visibility (PRIVATE | PUBLIC) → Community discovery → Copy Trip
```

### Module layout

```text
src/
├── app.ts                 Express app assembly (no route logic lives here)
├── server.ts               Process bootstrap: connect deps, listen, graceful shutdown
├── config/                 env / database / redis configuration surfaces
├── lib/                    prisma client, redis client, jwt, logger, swagger — infra singletons
├── middleware/              auth, validation, error handling, rate limiting, 404
├── utils/                   errors, response envelope, pagination, asyncHandler
├── routes/index.ts          composition root: mounts every module under /api/v1
└── modules/
    ├── auth/                register, login, forgot/reset password
    ├── users/                profile, saved destinations
    ├── trips/                trip CRUD + trip-stop CRUD/reorder (nested resource tree root)
    ├── cities/               city search/browse (Redis-cached)
    ├── activities/           activity catalog + attach/detach activities on a trip
    ├── itinerary/            day-wise itinerary view + reorder
    ├── budgets/               expenses CRUD + calculated cost breakdown
    ├── community/            public trip browsing + copy-trip
    └── admin/                 admin-only user/trip lists + platform analytics (Redis-cached)
```

Every module owns its own `*.schema.ts` (Zod), `*.repository.ts` (Prisma access only),
`*.service.ts` (business rules — ownership checks, calculations, transactions),
`*.controller.ts` (thin: parse request → call service → send response), and `*.routes.ts`.

Nested trip resources (`/trips/:tripId/stops`, `/activities`, `/itinerary`, `/expenses`,
`/budget`, `/copy`) are each owned by their respective module and composed together in
`src/modules/trips/trips.routes.ts` — that file is a composition root, not where business
logic lives. Ownership checks for a trip are centralized once in `tripsService.getOwnedTrip()`
and reused by every module that operates on a trip's sub-resources, so that rule is never
duplicated.

## 2. Tech stack

Node.js · TypeScript (strict) · Express · PostgreSQL · Prisma · Redis (ioredis) · JWT ·
Zod · Docker Compose · Jest + Supertest · ESLint + Prettier · swagger-jsdoc/swagger-ui-express.

## 3. Getting started

### Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres + Redis) — or your own local Postgres 16 / Redis 7

### Setup

```bash
cp .env.example .env          # fill in real secrets before deploying anywhere shared
npm install
docker compose up -d postgres redis
npx prisma migrate deploy     # applies prisma/migrations/*
npm run prisma:seed           # sample users, cities, activities, one demo trip
npm run dev                   # starts the API on http://localhost:4000
```

Or run everything (API included) in Docker:

```bash
docker compose up -d
```

The backend container runs `npm run dev` (`tsx watch`) against the `postgres`/`redis`
service names, with `./src` and `./prisma` bind-mounted for live reload.

### Seeded accounts

| Role  | Email                     | Password       |
|-------|---------------------------|----------------|
| ADMIN | admin@globetrotter.dev    | Password123!   |
| USER  | traveler@globetrotter.dev | Password123!   |

The traveler account also owns one demo trip ("European Highlights", Paris → Rome) with
stops, itinerary activities, and expenses already attached, plus a `PUBLIC` visibility
so it's browsable via `/api/v1/community/trips`.

## 4. Environment variables

See `.env.example` for the full list with defaults. Key groups:

- **App**: `NODE_ENV`, `PORT`, `API_PREFIX` (`/api/v1`), `CORS_ORIGIN`
- **Database**: `DATABASE_URL`
- **Redis**: `REDIS_URL`
- **JWT**: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`,
  `JWT_REFRESH_EXPIRES_IN`
- **Password reset**: `PASSWORD_RESET_TOKEN_EXPIRES_MINUTES`
- **Rate limiting**: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- **Security**: `BCRYPT_SALT_ROUNDS`

All variables are validated at startup with Zod (`src/config/env.ts`) — the process exits
immediately with a readable error if anything required is missing or malformed, instead of
failing confusingly at first use.

## 5. Database & Prisma

```bash
npm run prisma:generate       # regenerate the Prisma client after schema changes
npm run prisma:migrate        # create + apply a new migration in development
npm run prisma:migrate:deploy # apply existing migrations (CI/production)
npm run prisma:studio         # visual data browser
npm run prisma:seed           # (re)run prisma/seed.ts
npm run db:reset              # drop, recreate, migrate, and reseed the dev database
```

`prisma/schema.prisma` uses UUID primary keys, explicit foreign keys with deliberate
`onDelete` behavior (cascade for owned aggregates like Trip → TripStop → TripActivity;
restrict for shared reference data like City), unique constraints (`User.email`,
`City(name, country)`, `SavedDestination(userId, cityId)`, `Trip.shareSlug`), and indexes on
every foreign key plus the columns search/filter endpoints actually query
(`City.country/region/popularity`, `Activity.category/cost`, `Trip.visibility`, etc.).

Multi-step writes that must be atomic — trip-stop reorder, itinerary reorder, and
copy-trip — go through `prisma.$transaction`, not sequential unguarded calls.

## 6. Running tests

```bash
npm test              # everything
npm run test:unit      # tests/unit — pure functions, no external dependencies
npm run test:integration  # tests/integration — spins up the Express app via supertest
```

Unit tests (`tests/unit`) never touch the network. Integration tests (`tests/integration`)
exercise the real Express app (`createApp()`) with `supertest` and **require a reachable
Postgres + Redis** matching `.env.test` — the simplest way to get that is:

```bash
docker compose up -d postgres redis
DATABASE_URL="postgresql://globetrotter:globetrotter@localhost:5432/globetrotter_test?schema=public" \
  npx prisma migrate deploy
npm test
```

`.env.test` (loaded via `tests/setup.ts`, overriding `.env`) points at a separate
`globetrotter_test` database so integration tests never touch dev/seed data.

## 7. API structure

All endpoints are versioned under `API_PREFIX` (`/api/v1` by default). `GET /health` is
intentionally unversioned since it's an infra-level liveness/readiness probe.

```text
GET    /health

POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

GET    /api/v1/users/me
PATCH  /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/me/saved-destinations
POST   /api/v1/users/me/saved-destinations
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

GET    /api/v1/trips/:tripId/stops
POST   /api/v1/trips/:tripId/stops
PATCH  /api/v1/trips/:tripId/stops/:stopId
DELETE /api/v1/trips/:tripId/stops/:stopId
PATCH  /api/v1/trips/:tripId/stops/reorder

POST   /api/v1/trips/:tripId/activities
PATCH  /api/v1/trips/:tripId/activities/:activityId
DELETE /api/v1/trips/:tripId/activities/:activityId

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

Errors never leak stack traces, database internals, password hashes, JWT secrets, or Redis
credentials (`src/middleware/error.middleware.ts`).

## 8. API documentation

In non-production environments, interactive Swagger UI is served at `/api-docs`, generated
from `@openapi` JSDoc comments on each `*.routes.ts` file (`src/lib/swagger.ts`). It currently
documents the auth, trip, city, activity, and community route groups as a foundation —
extend the JSDoc blocks as new business rules land.

## 9. Auth & authorization model

- Passwords are hashed with `bcryptjs` (`BCRYPT_SALT_ROUNDS`, never stored in plaintext).
- `POST /auth/login` and `/register` issue a short-lived JWT **access token** and a longer-lived
  **refresh token** (refresh-token rotation/endpoint is intentionally left as a follow-up —
  the signing/verification primitives already exist in `src/lib/jwt.ts`).
- `authenticate()` (`src/middleware/auth.middleware.ts`) verifies the `Authorization: Bearer`
  header and attaches `req.user = { id, email, role }`.
- `authorize(Role.ADMIN)` restricts a route to a role; `/api/v1/admin/*` requires it.
- Ownership (a user may only modify **their own** trips/expenses/stops/etc.) is enforced in
  the service layer via `tripsService.getOwnedTrip()`, not by trusting `req.user.id` blindly
  in controllers.
- `forgot-password` never reveals whether an email is registered; it always returns the same
  message. The reset token is currently logged via `logger.info` instead of emailed — wiring
  a real email provider is a clearly marked `TODO` in `auth.service.ts`.

## 10. What's deliberately not built yet

Per the hackathon skeleton scope: no AI itinerary generation, no external travel/geocoding
APIs, no payments, no Elasticsearch/Kafka/microservices/GraphQL/Kubernetes. Rate limiting,
caching, and transactions are wired as infrastructure but only applied where they matter
today (auth, city/activity search, admin analytics, reorder/copy operations) — extend the
same patterns rather than introducing new ones as the app grows.

## 11. Code quality

```bash
npm run typecheck   # tsc --noEmit, strict mode
npm run lint         # ESLint (import ordering, no-unused-vars, no-explicit-any warnings)
npm run lint:fix
npm run format       # Prettier
npm run format:check
```
