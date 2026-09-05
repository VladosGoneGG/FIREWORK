# ---- build the static bundle ----
FROM node:20-alpine AS build
WORKDIR /app

# Baked into the client bundle at build time (Vite only inlines VITE_-prefixed
# vars, and only at build time — these can't be changed at container runtime).
ARG VITE_BASE_PATH=/
ARG VITE_TELEGRAM_BOT_TOKEN=
ARG VITE_TELEGRAM_CHAT_ID=
ENV VITE_BASE_PATH=$VITE_BASE_PATH \
	VITE_TELEGRAM_BOT_TOKEN=$VITE_TELEGRAM_BOT_TOKEN \
	VITE_TELEGRAM_CHAT_ID=$VITE_TELEGRAM_CHAT_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- serve the bundle + reverse-proxy the API ----
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
