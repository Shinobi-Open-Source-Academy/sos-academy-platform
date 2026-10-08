# syntax=docker/dockerfile:1.7
#
# One Dockerfile for the whole monorepo. Build context is the repository root.
#
#   API           docker build --target server -t sos-server .
#   Web apps      docker build --target next --build-arg APP=website --build-arg PORT=3000 \
#                   --build-arg NEXT_PUBLIC_API_URL=... --build-arg NEXT_PUBLIC_BLOG_URL=... \
#                   --build-arg NEXT_PUBLIC_HACKER_URL=... -t sos-website .
#                 APP = website | admin | hacker | blog. The NEXT_PUBLIC_* build args each app
#                 needs are required (no defaults): website API+BLOG+HACKER, blog API+WEBSITE,
#                 admin API, hacker API.
#   Discord bot   docker build --target kunai-bot -t sos-kunai-bot .
#
# Every image runs as the unprivileged `node` user and honours $PORT, so the same image runs on
# Cloud Run, Fly.io, Railway, Kubernetes, a plain VPS, etc.

ARG NODE_VERSION=22
# Keep in sync with "packageManager" in package.json.
ARG PNPM_VERSION=10.18.1

# ---------------------------------------------------------------------------
# base: Node + pnpm. Shared by every build stage.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
ENV CI=true \
    HUSKY=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    npm_config_store_dir=/pnpm/store
# libc6-compat: prebuilt native binaries (Next.js SWC, sharp) expect glibc symbols on Alpine.
RUN apk add --no-cache libc6-compat \
 && corepack enable \
 && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /repo

# ---------------------------------------------------------------------------
# fetch: download every dependency into the pnpm store from the lockfile alone, so this (slow)
# layer is only invalidated when dependencies change, not on every source edit.
# ---------------------------------------------------------------------------
FROM base AS fetch
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

# ---------------------------------------------------------------------------
# deps: the full workspace, installed offline from the store.
# ---------------------------------------------------------------------------
FROM fetch AS deps
COPY . .
RUN pnpm install --offline --frozen-lockfile

# ---------------------------------------------------------------------------
# server: NestJS API
# ---------------------------------------------------------------------------
FROM deps AS build-server
# Inline every dependency into main.js (see apps/server/webpack.config.js), so the runtime image
# needs no node_modules: it is just Node plus one file. This also keeps versions exactly as locked,
# unlike `pnpm deploy --legacy`, which re-resolves from the registry and ignores pnpm-lock.yaml
# and the security overrides in package.json.
ENV BUNDLE_ALL_DEPS=true
# `server...` = the server plus the workspace packages it depends on (@sos-academy/shared).
RUN pnpm --filter "server..." run build

FROM node:${NODE_VERSION}-alpine AS server
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4200
WORKDIR /app
COPY --from=build-server --chown=node:node /repo/dist/apps/server ./dist
USER node
EXPOSE 4200
# GET /api is the API root (no database round-trip): it answers as soon as the app is listening.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT}/api" || exit 1
CMD ["node", "dist/main.js"]

# ---------------------------------------------------------------------------
# next: any of the Next.js apps (website, admin, hacker, blog), selected with --build-arg APP=...
# ---------------------------------------------------------------------------
FROM deps AS build-next
ARG APP
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WEBSITE_URL
ARG NEXT_PUBLIC_BLOG_URL
ARG NEXT_PUBLIC_HACKER_URL
ENV NEXT_OUTPUT=standalone
# NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so they are baked into
# the image (one image per environment). There are deliberately NO defaults: a missing value fails
# the build here instead of shipping an image that quietly points at the wrong host.
RUN set -eu; \
    case "${APP:-}" in \
      website) required="NEXT_PUBLIC_API_URL NEXT_PUBLIC_BLOG_URL NEXT_PUBLIC_HACKER_URL" ;; \
      blog)    required="NEXT_PUBLIC_API_URL NEXT_PUBLIC_WEBSITE_URL" ;; \
      admin|hacker) required="NEXT_PUBLIC_API_URL" ;; \
      *) echo "ERROR: --build-arg APP must be one of: website, admin, hacker, blog (got '${APP:-}')" >&2; exit 1 ;; \
    esac; \
    for name in $required; do \
      eval "value=\${$name:-}"; \
      [ -n "$value" ] || { echo "ERROR: --build-arg $name is required to build '$APP' and has no default" >&2; exit 1; }; \
    done
RUN pnpm --filter "${APP}..." run build

FROM node:${NODE_VERSION}-alpine AS next
ARG APP
ARG PORT=3000
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    APP=${APP} \
    PORT=${PORT} \
    HOSTNAME=0.0.0.0
WORKDIR /app
# With outputFileTracingRoot set to the monorepo root, standalone output is laid out as
# apps/<app>/server.js. Static assets and public/ are not part of it and must be copied in.
COPY --from=build-next --chown=node:node /repo/apps/${APP}/.next/standalone ./
COPY --from=build-next --chown=node:node /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=build-next --chown=node:node /repo/apps/${APP}/public ./apps/${APP}/public
USER node
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT}/" || exit 1
CMD ["sh", "-c", "exec node apps/${APP}/server.js"]

# ---------------------------------------------------------------------------
# kunai-bot: Discord reminder bot (long-running worker, no HTTP port)
# ---------------------------------------------------------------------------
FROM deps AS build-kunai-bot
RUN pnpm --filter "kunai-bot..." run build
# Production dependencies straight from the lockfile. pnpm always installs the workspace root's
# dependencies too (the root package.json lists every app's runtime deps), which makes this image
# much larger than the bot needs; moving those root deps into the apps would shrink it.
RUN rm -rf node_modules apps/*/node_modules libs/*/node_modules \
 && pnpm install --offline --frozen-lockfile --prod --filter "kunai-bot..."

FROM node:${NODE_VERSION}-alpine AS kunai-bot
ENV NODE_ENV=production
WORKDIR /app/apps/kunai-bot
COPY --from=build-kunai-bot --chown=node:node /repo/node_modules /app/node_modules
COPY --from=build-kunai-bot --chown=node:node /repo/apps/kunai-bot/node_modules ./node_modules
COPY --from=build-kunai-bot --chown=node:node /repo/apps/kunai-bot/dist ./dist
USER node
CMD ["node", "dist/index.js"]
