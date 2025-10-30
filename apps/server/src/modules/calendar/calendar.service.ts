import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CalendarEvent, CalendarEventDocument } from './schemas/calendar-event.schema';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name) private calendarEventModel: Model<CalendarEventDocument>
  ) {}

  async create(createCalendarEventDto: CreateCalendarEventDto): Promise<CalendarEvent> {
    const createdEvent = new this.calendarEventModel(createCalendarEventDto);
    return createdEvent.save();
  }

  async findAll(): Promise<CalendarEvent[]> {
    return this.calendarEventModel
      .find({ isActive: true })
      .populate('organizer', 'name email')
      .populate('community', 'name slug')
      .populate('project', 'name')
      .sort({ startTime: 1 })
      .exec();
  }

  async findOne(id: string): Promise<CalendarEvent> {
    const event = await this.calendarEventModel
      .findById(id)
      .populate('organizer', 'name email')
      .populate('community', 'name slug')
      .populate('project', 'name')
      .populate('attendees', 'name email')
      .exec();

    if (!event) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateCalendarEventDto: UpdateCalendarEventDto): Promise<CalendarEvent> {
    const updatedEvent = await this.calendarEventModel
      .findByIdAndUpdate(id, updateCalendarEventDto, { new: true })
      .exec();

    if (!updatedEvent) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }

    return updatedEvent;
  }

  async remove(id: string): Promise<CalendarEvent> {
    const deletedEvent = await this.calendarEventModel.findByIdAndDelete(id).exec();

    if (!deletedEvent) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }

    return deletedEvent;
  }

  /**
   * Generate calendar invite link (Google Calendar)
   */
  async generateInviteLink(id: string): Promise<{ googleCalendarLink: string; icalLink: string }> {
    const event = await this.findOne(id);

    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
    const formatGoogleDate = (date: Date) => {
      return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    };

    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(startTime)}/${formatGoogleDate(endTime)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || event.meetingLink || '')}`;

    // Simple iCal format
    const icalLink = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatGoogleDate(startTime)}
DTEND:${formatGoogleDate(endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || event.meetingLink || ''}
END:VEVENT
END:VCALENDAR`;

    return {
      googleCalendarLink,
      icalLink,
    };
  }
}
