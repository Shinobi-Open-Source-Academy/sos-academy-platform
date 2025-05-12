import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from './common/config/env.config';

async function bootstrap() {
  // Log the NODE_ENV value when starting
  Logger.log(`Starting server with NODE_ENV: ${envConfig.nodeEnv}`);

  const app = await NestFactory.create(AppModule);
  const port = envConfig.port;

  // Configure CORS
  app.enableCors({
    origin: envConfig.cors.origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configure API prefix
  app.setGlobalPrefix('api');

  // Configure validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port} (${envConfig.nodeEnv})`
  );
}

bootstrap();
