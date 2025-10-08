import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityModule } from '../community/community.module';
import { ProjectModule } from '../project/project.module';
import { UserModule } from '../user/user.module';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CalendarEvent, CalendarEventSchema } from './schemas/calendar-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CalendarEvent.name, schema: CalendarEventSchema }]),
    UserModule,
    ProjectModule,
    CommunityModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [MongooseModule, CalendarService],
})
export class CalendarModule {}
