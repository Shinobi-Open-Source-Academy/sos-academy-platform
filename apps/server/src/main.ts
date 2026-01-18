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

  // allow all origins for now
  app.enableCors();

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
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen(port, envConfig.host);

  // Determine the base URL (use APP_URL if set, otherwise construct from host/port)
  const baseUrl =
    envConfig.appUrl ||
    (envConfig.host === '0.0.0.0'
      ? `http://localhost:${port}`
      : `http://${envConfig.host}:${port}`);

  Logger.log(`🚀 Application is running on: ${baseUrl} (${envConfig.nodeEnv})`);
  Logger.log(`📚 Swagger documentation available at: ${baseUrl}/api/docs`);

  // Auto-seed database if empty
  await autoSeedDatabase(app);
}

async function autoSeedDatabase(app): Promise<void> {
  const logger = new Logger('AutoSeed');

  try {
    const seederService = app.get(SeederService);

    // Check if database needs seeding
    logger.log('Checking database seeding status...');
    const status = await seederService.getDatabaseStatus();

    if (status.totalCommunities === 0) {
      logger.log('Database is empty. Seeding communities...');
      await seederService.seedCommunities();
      logger.log('Database seeded successfully');
    } else {
      logger.log(`Database already seeded (${status.totalCommunities} communities found)`);
    }

    // Always try to seed admin user if it doesn't exist
    logger.log('Checking admin user status...');
    await seederService.seedAdmin();
    logger.log('Admin user check completed');
  } catch (error) {
    logger.error('Auto-seeding failed:', error);
    logger.warn('Application will continue without seeding');
  }
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
