import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityModule } from '../community/community.module';
import { ProjectModule } from '../project/project.module';
import { UserModule } from '../user/user.module';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { NotesBotService } from './notesbot.service';
import { CalendarEvent, CalendarEventSchema } from './schemas/calendar-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CalendarEvent.name, schema: CalendarEventSchema }]),
    ConfigModule,
    UserModule,
    ProjectModule,
    CommunityModule,
  ],
  controllers: [CalendarController],
  providers: [CalendarService, NotesBotService],
  exports: [MongooseModule, CalendarService],
})
export class CalendarModule {}
