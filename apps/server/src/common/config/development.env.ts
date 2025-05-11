// Development environment configuration
// This file serves as a fallback when no .env file is present
export const developmentEnv = {
  PORT: '3333',
  NODE_ENV: 'development',
  // MONGODB_URI: 'mongodb://localhost:27017/sos-academy',
  JWT_SECRET: 'dev_jwt_secret_key',
  JWT_EXPIRATION: '1d',
  CORS_ORIGIN: 'http://localhost:4200',
  LOG_LEVEL: 'debug',
};
