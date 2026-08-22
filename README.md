# 🌍 GlobeTrotter — Personalized Travel Planning Platform

[![Odoo Hackathon](https://img.shields.io/badge/Odoo%20%C3%97%20LDCE%20Hackathon-2026-F4C95D?style=for-the-badge&logoColor=252525)](https://github.com/raunak0400/odoo-hackathon-project)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite%20%7C%20Tailwind-4E7360?style=for-the-badge&logo=react)](https://github.com/raunak0400/odoo-hackathon-project)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2020%20%7C%20Express%20%7C%20Prisma%20%7C%20PostgreSQL-304B3D?style=for-the-badge&logo=node.js)](https://github.com/raunak0400/odoo-hackathon-project)
[![Cache](https://img.shields.io/badge/Cache%20%26%20Rate%20Limit-Redis%207-D96B43?style=for-the-badge&logo=redis)](https://github.com/raunak0400/odoo-hackathon-project)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **GlobeTrotter** is a modern, full-stack travel planning platform built for the **Odoo × LDCE Ahmedabad Hackathon '26**. It empowers travelers to architect multi-city journeys, generate day-wise itineraries, track category-level budgets in real-time, collaborate and clone community trips, view schedule timelines on an interactive calendar, and monitor platform health through an administrative dashboard.

---

## 📑 Table of Contents

1. [Executive Summary & Features](#-executive-summary--features)
2. [Product Flow & Screen Breakdown (Screens 1–12)](#-product-flow--screen-breakdown)
3. [Design System & Aesthetics](#-design-system--aesthetics)
4. [System Architecture](#-system-architecture)
5. [Repository Structure](#-repository-structure)
6. [Tech Stack](#-tech-stack)
7. [Quickstart & Installation](#-quickstart--installation)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#1-backend-setup)
   - [Frontend Setup](#2-frontend-setup)
   - [Docker Compose Quickstart](#3-docker-compose-quickstart)
8. [API Documentation & Endpoints](#-api-documentation--endpoints)
9. [Testing & Quality Assurance](#-testing--quality-assurance)
10. [Hackathon Team & Credits](#-hackathon-team--credits)

---

## 🌟 Executive Summary & Features

- **🗺️ Multi-City Route Planning**: Seamlessly add multiple destination stops with scheduled arrival/departure dates and destination summaries.
- **📅 Dynamic Day-Wise Itinerary**: Organize activities, dining, and transit into structured day buckets with drag-and-drop reordering and duration tracking.
- **💰 Real-Time Budget & Expense Tracking**: Dynamic cost calculation with visual budget progress bars, category breakdowns (Accommodation, Food, Activities, Transport), and daily spend projections.
- **👥 Community Stories & 1-Click Itinerary Cloning**: Publish public trip itineraries with custom shareable slugs and allow fellow explorers to fork/clone trips into their personal portfolios.
- **📆 Interactive Travel Calendar**: Month, week, and list views displaying scheduled trips and daily itinerary activities with status indicators.
- **🔍 Destination & Activity Discovery Catalog**: Filterable catalog across regions, travel styles, ratings, and price levels backed by high-performance Redis caching.
- **🛡️ Enterprise-Grade Authentication & RBAC**: JWT access tokens, rotating Redis-backed refresh tokens, secure password hashing (`bcryptjs`), and role-based access control.
- **📊 Admin Telemetry & Analytics Dashboard**: Real-time management table for travelers, ranked global city/activity popularity scores, and pure SVG/CSS growth visualizations.

---

## 📱 Product Flow & Screen Breakdown

GlobeTrotter implements a cohesive 12-screen information architecture:

| Screen | View / Route | Description |
|---|---|---|
| **Screen 1** | `/login` | Secure traveler sign-in with email/password, validation, and token issuance. |
| **Screen 2** | `/register` | Traveler onboarding collecting profile information, avatar preview, and travel style preferences. |
| **Screen 3** | `/` or `/home` | Editorial landing page featuring hero destination search, value propositions, curated experiences, and active trips. |
| **Screen 4** | `/trips/create` | Step-by-step trip creation wizard with multi-city destination selector, date pickers, and budget estimation. |
| **Screen 5** | `/trips/:tripId/build` | Interactive drag-and-drop itinerary builder for scheduling activities, hotels, and travel legs day by day. |
| **Screen 6** | `/trips` | My Trips portfolio categorized into **Ongoing**, **Upcoming**, and **Completed** journeys. |
| **Screen 7** | `/profile` | Traveler profile management, travel preference tags, notification preferences, and saved wishlists. |
| **Screen 8** | `/cities` & `/activities` | Searchable discovery catalogs with region filters, style tags, and quick "Add to Trip" modals. |
| **Screen 9** | `/trips/:tripId/itinerary` | Comprehensive itinerary view with cost breakdowns, category pie/bar distributions, and export/share tools. |
| **Screen 10** | `/community` | Public trip showcase with traveler stories, destination highlights, and instant trip cloning. |
| **Screen 11** | `/calendar` | Chronological multi-view calendar visualizing scheduled itineraries and activity timings. |
| **Screen 12** | `/admin` | Role-guarded administrative dashboard with user moderation, city analytics, activity trends, and platform KPIs. |

---

## 🎨 Design System & Aesthetics

The GlobeTrotter visual design system is designed with a warm, editorial, and tactile travel aesthetic:

```
┌────────────────────────────────────────────────────────────────────────┐
│  #F7F1E5  Background Canvas     │  Warm sand / linen base tone         │
│  #FFF9EE  Surface / Cards       │  Warm cream elevation card surface   │
│  #F4C95D  Primary Gold Accent   │  Sun-drenched gold CTA & highlights │
│  #4E7360  Sage Green            │  Earthy botanical balance & success │
│  #304B3D  Deep Sage             │  Forest green dark accent           │
│  #252525  Dark Espresso         │  Rich readable typography           │
│  #6F6A60  Muted Slate           │  Subtle secondary labels & borders   │
│  #D96B43  Terracotta Coral      │  Vibrant adventurous energy          │
└────────────────────────────────────────────────────────────────────────┘
```

- **Typography**: Editorial Serif headers (`font-serif`) paired with crisp geometric Sans-serif body copy (`font-sans`).
- **Responsive Geometry**: Rounded corners (`rounded-2xl`, `rounded-[24px]`), soft layered elevation shadows, and micro-interactions.

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         GlobeTrotter Frontend                            │
│           React 19 · TypeScript · Vite · Tailwind CSS · React Router     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │  REST API Requests (JSON / JWT)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Express.js Gateway                              │
│         Auth Guard · Zod Validation · Rate Limiter · Error Boundary      │
└──────────────────┬─────────────────────────────────────┬─────────────────┘
                   │                                     │
                   ▼                                     ▼
┌──────────────────────────────────────┐  ┌────────────────────────────────┐
│         Prisma ORM Layer             │  │       Redis 7 Cache Layer      │
│  - Users & Profiles                  │  │  - City & Activity Catalog     │
│  - Trips & Multi-City Stops          │  │  - Community Trip Feed         │
│  - Day Itineraries & Activities      │  │  - Refresh Token Whitelist     │
│  - Budgets & Category Expenses       │  │  - Rate Limiting Store         │
└──────────────────┬───────────────────┘  └────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│        PostgreSQL 16 Database        │
│       Relational ACID Storage        │
└──────────────────────────────────────┘
```

---

## 📂 Repository Structure

```text
odoo-hackathon-project/
├── frontend/                     # Modern React SPA
│   ├── public/                   # Static icons & favicons
│   ├── src/
│   │   ├── components/           # Reusable UI components & modals
│   │   │   ├── admin/            # Screen 12: Admin dashboard components
│   │   │   ├── auth/             # Auth cards, protected routes, inputs
│   │   │   ├── calendar/         # Travel calendar views
│   │   │   ├── discovery/        # City details & "Add to Trip" modals
│   │   │   ├── itinerary/        # Day-by-day itinerary schedule cards
│   │   │   ├── landing/          # Hero banner, active trips, reviews
│   │   │   ├── layout/           # Shared layout wrappers
│   │   │   ├── profile/          # Profile form, password change modal
│   │   │   ├── trips/            # Trip cards, creation wizard steps
│   │   │   └── ui/               # Button, Modal, Input, Badge primitives
│   │   ├── context/              # AuthContext & ToastContext providers
│   │   ├── data/                 # Curated city, activity & fallback datasets
│   │   ├── pages/                # Screens 1–12 route page components
│   │   ├── routes/               # Lazy-loaded AppRoutes configuration
│   │   ├── services/             # API clients (auth, trips, catalog, admin)
│   │   └── types/                # TypeScript domain models & interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Production-Grade Node.js / Express API
│   ├── prisma/
│   │   ├── migrations/           # Versioned SQL migrations
│   │   ├── schema.prisma         # Data models & relations
│   │   └── seed.ts               # Database seeder (sample cities, activities, trips)
│   ├── src/
│   │   ├── config/               # Env parsing (Zod), DB & Redis setup
│   │   ├── lib/                  # Prisma client, Redis client, JWT, Logger, Swagger
│   │   ├── middleware/           # Auth, validation, rate limiting, error handling
│   │   ├── modules/              # Domain-driven feature modules:
│   │   │   ├── activities/       # Activity search & trip-activity assignments
│   │   │   ├── admin/            # Administrative stats, user CRUD
│   │   │   ├── auth/             # Registration, login, token refresh, logout
│   │   │   ├── budgets/          # Expenses CRUD & calculated cost breakdown
│   │   │   ├── cities/           # Destination search & lookup
│   │   │   ├── community/        # Public trips, sharing & 1-click clone
│   │   │   ├── itinerary/        # Day itinerary grouping & ordering
│   │   │   ├── trips/            # Trips & multi-city stops
│   │   │   └── users/            # Profile management & saved destinations
│   │   ├── routes/               # API route composition root (/api/v1)
│   │   ├── utils/                # Standardized response envelopes & error classes
│   │   ├── app.ts                # Express app configuration
│   │   └── server.ts             # Server entrypoint & graceful shutdown
│   ├── tests/
│   │   ├── unit/                 # Pure unit tests (errors, pagination)
│   │   └── integration/          # API endpoint integration test suites
│   ├── docker/                   # Docker scripts
│   ├── Dockerfile                # Multi-stage container build
│   ├── docker-compose.yml        # PostgreSQL 16 + Redis 7 + API container orchestration
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                    # Global git ignore configuration
├── LICENSE                       # MIT License
└── README.md                     # Comprehensive project documentation
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 (`react`, `react-dom`)
- **Language**: TypeScript 5 (Strict mode)
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React (`lucide-react`)
- **Routing**: React Router v7 (`react-router-dom`)
- **State & Alerts**: React Context (`AuthContext`, `ToastContext`)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **ORM**: Prisma 5 (`@prisma/client`)
- **Database**: PostgreSQL 16
- **Caching & Sessions**: Redis 7 (`ioredis`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Validation**: Zod 3
- **Security**: Helmet, CORS, Express Rate Limit (`rate-limit-redis`)
- **Documentation**: Swagger UI (`swagger-ui-express`, `swagger-jsdoc`)
- **Logging**: Pino (`pino`, `pino-http`, `pino-pretty`)
- **Testing**: Jest 29, Supertest 7, `ts-jest`

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`
- **Docker Desktop** (Optional, for instant PostgreSQL & Redis)

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   *Verify your `DATABASE_URL` (e.g. `postgresql://globetrotter:globetrotter@localhost:5432/globetrotter?schema=public`) and `REDIS_URL` (e.g. `redis://localhost:6379`).*

4. **Initialize the database & generate Prisma client**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Seed the database with destinations & activities**:
   ```bash
   npm run prisma:seed
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:4000` with the API root mounted at `/api/v1`.*

---

### 2. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional)**:
   ```bash
   cp .env.example .env
   ```
   *(Defaults to `VITE_API_URL=http://localhost:4000/api/v1`)*

4. **Start Vite development server**:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

### 3. Docker Compose Quickstart

To run the complete backend stack (PostgreSQL + Redis + Express API) in Docker:

```bash
cd backend
docker compose up -d
```

To stop containers:
```bash
docker compose down
```

---

## 📡 API Documentation & Endpoints

Interactive Swagger API documentation is available at:
👉 `http://localhost:4000/api/docs`

### Core API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Create a new traveler account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue tokens | No |
| `POST` | `/api/v1/auth/refresh` | Refresh expired access token | No |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh token session | Yes |
| `GET` | `/api/v1/users/me` | Fetch authenticated user profile | Yes |
| `PATCH` | `/api/v1/users/me` | Update name, phone, or avatar | Yes |
| `GET` | `/api/v1/cities` | Search global cities (Redis cached) | No |
| `GET` | `/api/v1/activities` | Search experiences & attractions | No |
| `GET` | `/api/v1/trips` | List all trips owned by user | Yes |
| `POST` | `/api/v1/trips` | Create a new multi-city trip | Yes |
| `GET` | `/api/v1/trips/:id` | Get complete trip details & legs | Yes |
| `DELETE` | `/api/v1/trips/:id` | Delete a trip | Yes |
| `POST` | `/api/v1/trips/:id/stops` | Add a destination stop to trip | Yes |
| `POST` | `/api/v1/trips/:id/activities`| Add an activity to a day itinerary | Yes |
| `GET` | `/api/v1/trips/:id/budget` | Get calculated budget summary | Yes |
| `POST` | `/api/v1/trips/:id/expenses`| Record a new trip expense | Yes |
| `GET` | `/api/v1/community/trips` | Browse public community itineraries | No |
| `POST` | `/api/v1/trips/:id/copy` | Clone a community trip into account | Yes |
| `GET` | `/api/v1/admin/analytics` | Retrieve administrative telemetry | Admin |

---

## 🧪 Testing & Quality Assurance

### Frontend Production Build
```bash
cd frontend
npm run build
```
*Validates TypeScript types, JSX compilation, asset optimizations, and route splitting.*

### Backend Unit & Integration Tests
```bash
cd backend
# Run unit tests
npm run test:unit

# Run full test suite
npm test
```

---

## 👥 Hackathon Team & Credits

**Project**: GlobeTrotter — Personalized Travel Planning Platform  
**Event**: Odoo × LDCE Ahmedabad Hackathon 2026  
**Repository**: [https://github.com/raunak0400/odoo-hackathon-project](https://github.com/raunak0400/odoo-hackathon-project)  

Built with ❤️ for travelers, explorers, and adventure seekers worldwide.
