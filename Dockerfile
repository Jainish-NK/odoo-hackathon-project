# ── Base ─────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN apk add --no-cache openssl

# ── Dependencies (cached layer) ─────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# ── Build ────────────────────────────────────────────────────
FROM base AS build
COPY package.json package-lock.json* ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Development image (used by docker-compose) ──────────────
FROM base AS development
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "run", "dev"]

# ── Production image ────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
