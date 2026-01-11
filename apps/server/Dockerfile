# ===== Stage 1: Build =====
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace packages
COPY apps/server/package.json apps/server/
COPY libs/shared/package.json libs/shared/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY libs/shared libs/shared
COPY apps/server apps/server
COPY tsconfig.base.json ./

# Build shared library first
RUN pnpm --filter @sos-academy/shared build

# Build server with webpack
RUN pnpm --filter server build

# ===== Stage 2: Production =====
FROM node:22-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.1 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace package.json files
COPY apps/server/package.json apps/server/
COPY libs/shared/package.json libs/shared/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts from builder stage
COPY --from=builder /app/dist/apps/server ./dist/apps/server
COPY --from=builder /app/libs/shared/dist ./libs/shared/dist

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Cloud Run will set PORT automatically, default to 8080
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api || exit 1

# Start the server
CMD ["node", "dist/apps/server/main.js"]
