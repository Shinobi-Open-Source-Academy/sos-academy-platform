const env = (key: string, fallback = '') => process.env[key] ?? fallback;

export const envConfig = {
  port: Number.parseInt(env('PORT', '4200'), 10),
  nodeEnv: env('NODE_ENV', 'development'),
  host: env('HOST', '0.0.0.0'),
  appUrl: env('APP_URL', ''),
  mongodb: {
    uri: env('MONGODB_URI', 'mongodb://localhost:27017/sos-academy'),
  },
  jwt: {
    secret: env('JWT_SECRET', 'default_jwt_secret_key_change_in_production'),
    expiresIn: env('JWT_EXPIRATION', '1d'),
  },
  cors: {
    origin: env('CORS_ORIGIN', 'http://localhost:3000'),
  },
  logging: {
    level: env('LOG_LEVEL', 'debug'),
  },
  admin: {
    email: env('ADMIN_EMAIL', 'admin@shinobi-open-source.academy'),
    password: env('ADMIN_PASSWORD', 'admin123'),
  },
};
