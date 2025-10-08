import { developmentEnv } from './development.env';

// If environment variables are not set, use development environment values
const getEnvValue = (key: string, defaultValue: string) => {
  return process.env[key] || developmentEnv[key] || defaultValue;
};

export const envConfig = {
  port: Number.parseInt(getEnvValue('PORT', '4200'), 10),
  nodeEnv: getEnvValue('NODE_ENV', 'development'),
  host: getEnvValue('HOST', '0.0.0.0'),
  appUrl: getEnvValue('APP_URL', ''), // e.g., https://api.yourdomain.com or left empty for auto-detection
  mongodb: {
    uri: getEnvValue('MONGODB_URI', 'mongodb://localhost:27017/sos-academy'),
  },
  jwt: {
    secret: getEnvValue('JWT_SECRET', 'default_jwt_secret_key_change_in_production'),
    expiresIn: getEnvValue('JWT_EXPIRATION', '1d'),
  },
  cors: {
    origin: getEnvValue('CORS_ORIGIN', 'http://localhost:3000'),
  },
  logging: {
    level: getEnvValue('LOG_LEVEL', 'debug'),
  },
  admin: {
    email: getEnvValue('ADMIN_EMAIL', 'admin@shinobi-open-source.academy'),
    password: getEnvValue('ADMIN_PASSWORD', 'admin123'),
  },
};
