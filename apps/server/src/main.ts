/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './common/config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = envConfig.port;
  
  // Configure CORS
  app.enableCors({
    origin: envConfig.cors.origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port} (${envConfig.nodeEnv})`);
}

bootstrap();
