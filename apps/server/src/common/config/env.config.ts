import { config as loadDotenv } from 'dotenv';
import { join } from 'path';

// Load .env before anything reads process.env.
// Two paths cover ts-node (cwd = apps/server) and compiled dist/ execution.
loadDotenv({ path: join(process.cwd(), '../../.env') });
loadDotenv({ path: join(__dirname, '../../../../../../.env') });

const env = (key: string, fallback = '') => process.env[key] ?? fallback;

export const envConfig = {
  port: Number.parseInt(env('PORT', '4200'), 10),
  nodeEnv: env('NODE_ENV', 'development'),
  host: env('HOST', '0.0.0.0'),
  appUrl: env('APP_URL', ''),
  session: {
    secret: env('SESSION_SECRET', 'change-this-secret-in-production'),
  },
  mongodb: {
    uri: env('MONGODB_URI', 'mongodb://localhost:27017/sos-academy'),
  },
  jwt: {
    secret: env('JWT_SECRET', 'default_jwt_secret_key_change_in_production'),
    expiresIn: env('JWT_EXPIRATION', '1d'),
    refreshSecret: env('JWT_REFRESH_SECRET', 'default_jwt_refresh_secret_key_change_in_production'),
    refreshExpiration: env('JWT_REFRESH_EXPIRATION', '7d'),
  },
  cors: {
    origin: env('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3001,http://localhost:3002'),
  },
  logging: {
    level: env('LOG_LEVEL', 'debug'),
  },
  admin: {
    url: env('ADMIN_URL', 'http://localhost:3001'),
    email: env('ADMIN_EMAIL', 'admin@shinobi-open-source.academy'),
    password: env('ADMIN_PASSWORD', 'admin123'),
  },
  frontends: {
    hackerPortalUrl: env('HACKER_PORTAL_URL', 'http://localhost:3000'),
  },
  hack: {
    /** Issues a hacker can hold at once (assigned, in progress or under review) */
    maxActiveClaims: Number.parseInt(env('HACK_MAX_ACTIVE_CLAIMS', '3'), 10),
    sync: {
      /** Poll GitHub for the pull requests of assigned issues */
      enabled: env('HACK_SYNC_ENABLED', 'true') !== 'false',
      intervalMinutes: Number.parseInt(env('HACK_SYNC_INTERVAL_MINUTES', '10'), 10),
      /** Stop a run early when fewer GitHub API calls than this are left */
      minRateLimit: Number.parseInt(env('HACK_SYNC_MIN_RATE_LIMIT', '50'), 10),
    },
  },
  github: {
    clientId: env('GITHUB_CLIENT_ID', 'default_github_client_id_change_in_production'),
    clientSecret: env('GITHUB_CLIENT_SECRET', 'default_github_client_secret_change_in_production'),
    callbackUrl: env('GITHUB_CALLBACK_URL', 'http://localhost:4200/auth/github/callback'),
  },
};
