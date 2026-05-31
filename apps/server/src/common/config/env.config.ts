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
  },
  cors: {
    origin: env('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3001'),
  },
  logging: {
    level: env('LOG_LEVEL', 'debug'),
  },
  admin: {
    email: env('ADMIN_EMAIL', 'admin@shinobi-open-source.academy'),
    password: env('ADMIN_PASSWORD', 'admin123'),
  },
};
