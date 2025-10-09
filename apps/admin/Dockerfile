FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@10.18.1

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build admin app with production NODE_ENV
ENV NODE_ENV=production
RUN npx nx build admin --prod

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist/apps/admin/.next ./.next
COPY --from=builder /app/dist/apps/admin/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000"]
