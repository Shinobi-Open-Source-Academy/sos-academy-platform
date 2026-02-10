import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CalendarEventType } from '@sos-academy/shared';
import { Model } from 'mongoose';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateAvailabilitySlotDto } from './dto/update-availability-slot.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { CalendarEvent, CalendarEventDocument } from './schemas/calendar-event.schema';
import {
  MentorAvailabilitySlot,
  MentorAvailabilitySlotDocument,
} from './schemas/mentor-availability.schema';
import { MentorBlockedDate, MentorBlockedDateDocument } from './schemas/mentor-blocked-date.schema';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name)
    private calendarEventModel: Model<CalendarEventDocument>,
    @InjectModel(MentorAvailabilitySlot.name)
    private availabilitySlotModel: Model<MentorAvailabilitySlotDocument>,
    @InjectModel(MentorBlockedDate.name)
    private blockedDateModel: Model<MentorBlockedDateDocument>
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

  /**
   * Get upcoming events (public endpoint for website)
   * Returns the next 5 upcoming events sorted by start time
   */
  async findUpcoming(limit = 5): Promise<CalendarEvent[]> {
    const now = new Date();
    return this.calendarEventModel
      .find({
        isActive: true,
        startTime: { $gte: now },
      })
      .populate('community', 'name slug')
      .sort({ startTime: 1 })
      .limit(limit)
      .select(
        'title description startTime endTime eventType meetingLink location community isFeatured'
      )
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

    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formatGoogleDate(startTime)}/${formatGoogleDate(
      endTime
    )}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(
      event.location || event.meetingLink || ''
    )}`;

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

  private ensureValidRange(startTime: Date, endTime: Date) {
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }
  }

  async createAvailabilitySlot(dto: CreateAvailabilitySlotDto): Promise<MentorAvailabilitySlot> {
    this.ensureValidRange(dto.startTime, dto.endTime);
    const createdSlot = new this.availabilitySlotModel({
      mentor: dto.mentorId,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });
    return createdSlot.save();
  }

  async listAvailabilitySlots(
    mentorId: string,
    start?: Date,
    end?: Date
  ): Promise<MentorAvailabilitySlot[]> {
    const query: Record<string, unknown> = {
      mentor: mentorId,
      isActive: true,
    };

    if (start || end) {
      const startTime: Record<string, Date> = {};
      const endTime: Record<string, Date> = {};
      if (end) startTime.$lt = end;
      if (start) endTime.$gt = start;

      if (Object.keys(startTime).length > 0) {
        query.startTime = startTime;
      }
      if (Object.keys(endTime).length > 0) {
        query.endTime = endTime;
      }
    }

    return this.availabilitySlotModel.find(query).sort({ startTime: 1 }).exec();
  }

  async updateAvailabilitySlot(
    id: string,
    dto: UpdateAvailabilitySlotDto
  ): Promise<MentorAvailabilitySlot> {
    if (dto.startTime && dto.endTime) {
      this.ensureValidRange(dto.startTime, dto.endTime);
    }
    const updateFields: Record<string, unknown> = {};
    if (dto.mentorId) updateFields.mentor = dto.mentorId;
    if (dto.startTime) updateFields.startTime = dto.startTime;
    if (dto.endTime) updateFields.endTime = dto.endTime;

    const updatedSlot = await this.availabilitySlotModel
      .findByIdAndUpdate(id, updateFields, { new: true })
      .exec();

    if (!updatedSlot) {
      throw new NotFoundException(`Availability slot with ID ${id} not found`);
    }

    return updatedSlot;
  }

  async removeAvailabilitySlot(id: string): Promise<MentorAvailabilitySlot> {
    const deletedSlot = await this.availabilitySlotModel.findByIdAndDelete(id).exec();
    if (!deletedSlot) {
      throw new NotFoundException(`Availability slot with ID ${id} not found`);
    }
    return deletedSlot;
  }

  async createBlockedDate(dto: CreateBlockedDateDto): Promise<MentorBlockedDate> {
    const startOfDay = new Date(dto.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await this.blockedDateModel
      .findOne({
        mentor: dto.mentorId,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();
    if (existing) {
      return existing;
    }

    const createdBlocked = new this.blockedDateModel({
      mentor: dto.mentorId,
      date: dto.date,
      reason: dto.reason,
    });
    return createdBlocked.save();
  }

  async listBlockedDates(mentorId: string, start?: Date, end?: Date): Promise<MentorBlockedDate[]> {
    const query: Record<string, unknown> = { mentor: mentorId };
    if (start || end) {
      const dateFilter: Record<string, Date> = {};
      if (start) dateFilter.$gte = start;
      if (end) dateFilter.$lte = end;
      query.date = dateFilter;
    }
    return this.blockedDateModel.find(query).sort({ date: 1 }).exec();
  }

  async removeBlockedDate(id: string): Promise<MentorBlockedDate> {
    const deletedBlocked = await this.blockedDateModel.findByIdAndDelete(id).exec();
    if (!deletedBlocked) {
      throw new NotFoundException(`Blocked date with ID ${id} not found`);
    }
    return deletedBlocked;
  }

  async findBookedSessions(mentorId: string, start?: Date, end?: Date): Promise<CalendarEvent[]> {
    const now = new Date();
    const query: Record<string, unknown> = {
      isActive: true,
      organizer: mentorId,
      // @ts-ignore
      eventType: CalendarEventType.MENTOR_1V1,
    };

    const dateFilter: Record<string, Date> = {};
    dateFilter.$gte = start ?? now;
    if (end) {
      dateFilter.$lte = end;
    }
    query.startTime = dateFilter;

    return this.calendarEventModel
      .find(query)
      .populate('attendees', 'name email')
      .sort({ startTime: 1 })
      .exec();
  }
}
