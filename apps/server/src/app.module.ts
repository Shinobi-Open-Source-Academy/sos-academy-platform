import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './common/config/database.config';
import { envConfig } from './common/config/env.config';

// Import modules
import { UserModule } from './modules/user/user.module';
import { ProjectModule } from './modules/project/project.module';
import { CommunityModule } from './modules/community/community.module';
import { CalendarModule } from './modules/calendar/calendar.module';

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
    CalendarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
