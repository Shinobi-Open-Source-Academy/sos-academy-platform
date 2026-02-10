// Development environment configuration
// This file serves as a fallback when no .env file is present
export const developmentEnv = {
  PORT: '4200',
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb://localhost:27017/sos-academy',

  // JWT Configuration
  JWT_SECRET: 'dev_jwt_secret_key',
  JWT_EXPIRATION: '1d',
  JWT_REFRESH_SECRET: 'dev_jwt_refresh_secret_key',
  JWT_REFRESH_EXPIRATION: '7d',

  CORS_ORIGIN: 'http://localhost:3000,http://localhost:3001,http://localhost:3002',
  LOG_LEVEL: 'debug',

  // Email configuration
  EMAIL_FROM: 'no-reply@shinobi-open-source.academy',
  RESEND_API_KEY: '', // Required - get from https://resend.com/api-keys

  // Frontend URLs
  HACKER_PORTAL_URL: 'http://localhost:3002',

  // GitHub OAuth (use your actual credentials from .env or GitHub settings)
  GITHUB_CLIENT_ID: 'Ov23liytG22eP4HXSDOw',
  GITHUB_CLIENT_SECRET: '17edca4f32e11dda78de9c6880d6cffabd98b589',
  GITHUB_CALLBACK_URL: 'http://localhost:4200/api/auth/github/callback',
};
