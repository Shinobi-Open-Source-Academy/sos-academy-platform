import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './common/config/database.config';
import { envConfig } from './common/config/env.config';

import { CalendarModule } from './modules/calendar/calendar.module';
import { CommunityModule } from './modules/community/community.module';
import { ProjectModule } from './modules/project/project.module';
// Import modules
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => envConfig],
    }),
    MongooseModule.forRoot(databaseConfig.uri),
    UserModule,
    ProjectModule,
    CommunityModule,
    CalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
