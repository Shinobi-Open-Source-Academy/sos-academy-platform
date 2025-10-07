import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { envConfig } from './common/config/env.config';
import { SeederService } from './modules/seeder/seeder.service';

async function bootstrap() {
  // Check if this is a CLI command
  const command = process.argv[2];

  if (command && ['seed', 'clear', 'reset', 'status'].includes(command)) {
    // Run as CLI seeder
    await runSeederCommand(command);
    return;
  }

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

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('SOS Academy Platform API')
    .setDescription('API documentation for the Shinobi Open-Source Academy Platform')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addTag('communities', 'Community management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('calendar', 'Calendar and event management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port} (${envConfig.nodeEnv})`);
  Logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}

async function runSeederCommand(command: string): Promise<void> {
  // Create NestJS application context (no HTTP server)
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const seederService = app.get(SeederService);

  try {
    switch (command) {
      case 'clear':
        await seederService.clearCommunities();
        break;
      case 'reset':
        await seederService.resetCommunities();
        break;
      case 'status':
        await seederService.getDatabaseStatus();
        break;
      case 'seed':
      default:
        await seederService.seedCommunities();
        break;
    }

    console.log('🎉 Operation completed successfully!');
  } catch (error) {
    console.error('💥 Operation failed:', (error as Error).message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
