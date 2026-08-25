# Multi-stage build producing Next.js's standalone output — a minimal,
# self-contained server bundle (only the files actually needed at
# runtime, with node_modules pruned to what's resolved). Replaces the
# old single-stage Vite build (`npm run preview` on a dev-grade static
# server) which no longer applies: this app needs a real Node server for
# Server Actions and the checkout pipeline, not something that can be
# served as static files.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
	&& adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# No public/ directory exists yet (no static assets beyond the
# dynamically-generated favicon in app/icon.tsx) — add
# `COPY --from=builder /app/public ./public` here once one does.

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
