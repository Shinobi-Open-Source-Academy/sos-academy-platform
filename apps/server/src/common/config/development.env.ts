// Development environment configuration
// This file serves as a fallback when no .env file is present
export const developmentEnv = {
  PORT: '4200',
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb://localhost:27017/sos-academy',
  JWT_SECRET: 'dev_jwt_secret_key',
  JWT_EXPIRATION: '1d',
  CORS_ORIGIN: 'http://localhost:3000',
  LOG_LEVEL: 'debug',

  // Email configuration
  EMAIL_HOST: 'smtp.sendgrid.net',
  EMAIL_USER: 'apikey',
  EMAIL_PASSWORD: 'YOUR_SENDGRID_API_KEY', // Replace with actual key in production
  EMAIL_FROM: 'no-reply@sos-academy.org',
};
