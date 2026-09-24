# nginx gateway: serves the built SPA and reverse-proxies /api to the backend.
# Build context is the repo root so both ./frontend and ./gateway are reachable.

# --- Stage 1: build the frontend -------------------------------------------
FROM node:24-alpine AS frontend-build

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

# Explicit copies for the same reason as backend/Dockerfile: no .dockerignore.
COPY frontend/index.html frontend/vite.config.ts frontend/tsconfig*.json ./
COPY frontend/public ./public
COPY frontend/src ./src

# Same-origin API behind the gateway.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Stage 2: nginx ---------------------------------------------------------
FROM nginx:1.27-alpine

# The official image renders /etc/nginx/templates/*.template with envsubst
# into /etc/nginx/conf.d/ at start-up, so the upstream is set per environment.
ENV API_UPSTREAM=backend:3000
RUN rm /etc/nginx/conf.d/default.conf
COPY gateway/nginx.conf /etc/nginx/nginx.conf
COPY gateway/templates /etc/nginx/templates
COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
