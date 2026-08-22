# ── Base ─────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN apk add --no-cache openssl

# ── Dependencies (cached layer) ─────────────────────────────
FROM base AS deps
WORKDIR /usr/src/app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# ── Build ────────────────────────────────────────────────────
FROM base AS build
WORKDIR /usr/src/app/backend
COPY backend/package.json backend/package-lock.json* ./
COPY --from=deps /usr/src/app/backend/node_modules ./node_modules
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# ── Development image (used by docker-compose) ──────────────
FROM base AS development
WORKDIR /usr/src/app/backend
ENV NODE_ENV=development
COPY backend/package.json backend/package-lock.json* ./
COPY --from=deps /usr/src/app/backend/node_modules ./node_modules
COPY backend ./
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ── Production image ────────────────────────────────────────
FROM base AS production
WORKDIR /usr/src/app/backend
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY --from=build /usr/src/app/backend/dist ./dist
EXPOSE 4000
CMD ["node", "dist/src/server.js"]
