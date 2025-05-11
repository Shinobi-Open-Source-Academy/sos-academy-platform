import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CalendarEvent,
  CalendarEventSchema,
} from './schemas/calendar-event.schema';
import { UserModule } from '../user/user.module';
import { ProjectModule } from '../project/project.module';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalendarEvent.name, schema: CalendarEventSchema },
    ]),
    UserModule,
    ProjectModule,
    CommunityModule,
  ],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class CalendarModule {}
