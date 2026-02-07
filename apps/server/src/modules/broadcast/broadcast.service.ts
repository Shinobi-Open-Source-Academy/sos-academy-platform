import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole, UserStatus } from '@sos-academy/shared';
import { User } from '../user/schemas/user.schema';
import { Community } from '../community/schemas/community.schema';
import { EmailService } from '../email/email.service';
import { Broadcast } from './schemas/broadcast.schema';
import { CreateBroadcastDto, BroadcastRecipientType } from './dto/create-broadcast.dto';

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Community.name) private readonly communityModel: Model<Community>,
    @InjectModel(Broadcast.name) private readonly broadcastModel: Model<Broadcast>,
    private readonly emailService: EmailService
  ) {}

  async createBroadcast(
    dto: CreateBroadcastDto
  ): Promise<{ sent: number; scheduled: boolean; id: string }> {
    const recipients = await this.getRecipients(dto);
    const scheduled = !!dto.scheduledAt && new Date(dto.scheduledAt) > new Date();

    // Calculate eventEndTime from eventStartTime + eventDuration if both are provided
    let eventEndTime: string | undefined;
    if (dto.eventStartTime && dto.eventDuration) {
      const startTime = new Date(dto.eventStartTime);
      const durationMinutes = parseInt(dto.eventDuration, 10);
      if (!isNaN(durationMinutes)) {
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
        eventEndTime = endTime.toISOString();
      }
    }

    // Save broadcast to database
    const broadcast = new this.broadcastModel({
      ...dto,
      eventEndTime,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      scheduled,
      sentCount: 0,
      completed: false,
    });
    const savedBroadcast = await broadcast.save();

    if (scheduled) {
      // TODO: Implement scheduled sending (could use a job queue like Bull)
      this.logger.warn('Scheduled broadcasts not yet implemented. Sending immediately.');
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        await this.sendBroadcastEmail(recipient, dto);
        sentCount++;
      } catch (error) {
        const errorMsg = `Failed to send to ${recipient.email}: ${error instanceof Error ? error.message : String(error)}`;
        this.logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Broadcast completed with ${errors.length} errors:`, errors);
    }

    // Update broadcast with results
    savedBroadcast.sentCount = sentCount;
    savedBroadcast.completed = true;
    savedBroadcast.sentAt = new Date();
    await savedBroadcast.save();

    this.logger.log(`Broadcast sent to ${sentCount} recipients`);

    return { sent: sentCount, scheduled: false, id: savedBroadcast._id.toString() };
  }

  async getBroadcasts(limit: number = 50): Promise<Broadcast[]> {
    return this.broadcastModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec();
  }

  async getBroadcastById(id: string): Promise<Broadcast | null> {
    return this.broadcastModel.findById(id).lean().exec();
  }

  async retriggerBroadcast(
    id: string,
    updates?: Partial<CreateBroadcastDto>
  ): Promise<{ sent: number; scheduled: boolean; id: string }> {
    const broadcast = await this.broadcastModel.findById(id).exec();
    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found`);
    }

    // Merge original broadcast data with any provided updates
    const dto: CreateBroadcastDto = {
      subject: updates?.subject ?? broadcast.subject,
      message: updates?.message ?? broadcast.message,
      recipientType: updates?.recipientType ?? broadcast.recipientType,
      communitySlug: updates?.communitySlug ?? broadcast.communitySlug,
      userIds: updates?.userIds ?? broadcast.userIds,
      inactiveDays: updates?.inactiveDays ?? broadcast.inactiveDays,
      eventTitle: updates?.eventTitle ?? broadcast.eventTitle,
      eventStartTime: updates?.eventStartTime ?? (broadcast.eventStartTime ? String(broadcast.eventStartTime) : undefined),
      eventDuration: updates?.eventDuration ?? (broadcast.eventDuration ? String(broadcast.eventDuration) : undefined),
      eventMeetingLink: updates?.eventMeetingLink ?? broadcast.eventMeetingLink,
      eventDescription: updates?.eventDescription ?? broadcast.eventDescription,
      scheduledAt: updates?.scheduledAt ?? (broadcast.scheduledAt ? broadcast.scheduledAt.toISOString() : undefined),
    };

    const recipients = await this.getRecipients(dto);
    let sentCount = 0;
    const errors: string[] = [];

    // Resend emails
    for (const recipient of recipients) {
      try {
        await this.sendBroadcastEmail(recipient, dto);
        sentCount++;
      } catch (error) {
        const errorMsg = `Failed to send to ${recipient.email}: ${error instanceof Error ? error.message : String(error)}`;
        this.logger.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Broadcast retrigger completed with ${errors.length} errors:`, errors);
    }

    // Calculate eventEndTime from eventStartTime + eventDuration if both are provided
    let eventEndTime: string | undefined;
    if (dto.eventStartTime && dto.eventDuration) {
      const startTime = new Date(dto.eventStartTime);
      const durationMinutes = parseInt(dto.eventDuration, 10);
      if (!isNaN(durationMinutes)) {
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
        eventEndTime = endTime.toISOString();
      }
    }

    // Create a new broadcast record for the retrigger
    const newBroadcast = new this.broadcastModel({
      ...dto,
      eventEndTime,
      sentCount,
      completed: true,
      sentAt: new Date(),
    });
    const savedBroadcast = await newBroadcast.save();

    this.logger.log(`Broadcast retriggered and sent to ${sentCount} recipients`);

    return { sent: sentCount, scheduled: false, id: savedBroadcast._id.toString() };
  }

  private async getRecipients(dto: CreateBroadcastDto): Promise<User[]> {
    switch (dto.recipientType) {
      case BroadcastRecipientType.ALL_USERS:
        return this.userModel
          .find({ status: UserStatus.ACTIVE })
          .select('email name')
          .lean()
          .exec();

      case BroadcastRecipientType.COMMUNITY:
        if (!dto.communitySlug) {
          throw new NotFoundException('Community slug is required for COMMUNITY recipient type');
        }
        const community = await this.communityModel
          .findOne({ slug: dto.communitySlug })
          .lean()
          .exec();
        if (!community) {
          throw new NotFoundException(`Community with slug ${dto.communitySlug} not found`);
        }
        return this.userModel
          .find({
            communities: community._id,
            status: UserStatus.ACTIVE,
          })
          .select('email name')
          .lean()
          .exec();

      case BroadcastRecipientType.MENTORS:
        return this.userModel
          .find({
            role: UserRole.MENTOR,
            status: UserStatus.ACTIVE,
          })
          .select('email name')
          .lean()
          .exec();

      case BroadcastRecipientType.INACTIVE_USERS:
        if (!dto.inactiveDays) {
          throw new NotFoundException(
            'Inactive days threshold is required for INACTIVE_USERS recipient type'
          );
        }
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dto.inactiveDays, 10));
        // Find users who haven't been updated recently (using updatedAt or createdAt as fallback)
        return this.userModel
          .find({
            status: UserStatus.ACTIVE,
            $or: [
              { updatedAt: { $lt: daysAgo } },
              { createdAt: { $lt: daysAgo }, updatedAt: { $exists: false } },
            ],
          })
          .select('email name')
          .lean()
          .exec();

      case BroadcastRecipientType.SPECIFIC_USERS:
        if (!dto.userIds || dto.userIds.length === 0) {
          throw new NotFoundException('User IDs are required for SPECIFIC_USERS recipient type');
        }
        return this.userModel
          .find({
            _id: { $in: dto.userIds },
          })
          .select('email name')
          .lean()
          .exec();

      default:
        throw new Error(`Unknown recipient type: ${dto.recipientType}`);
    }
  }

  private async sendBroadcastEmail(recipient: User, dto: CreateBroadcastDto): Promise<void> {
    // Calculate eventEndTime from eventStartTime + eventDuration if both are provided
    let eventEndTime: string | undefined;
    if (dto.eventStartTime && dto.eventDuration) {
      const startTime = new Date(dto.eventStartTime);
      const durationMinutes = parseInt(dto.eventDuration, 10);
      if (!isNaN(durationMinutes)) {
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
        eventEndTime = endTime.toISOString();
      }
    }

    // Generate calendar links if event details are provided
    const calendarLinks = this.generateCalendarLinks(dto, eventEndTime);

    // Format duration for display
    const durationMinutes = dto.eventDuration ? parseInt(dto.eventDuration, 10) : undefined;
    const durationDisplay = durationMinutes
      ? durationMinutes >= 60
        ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
        : `${durationMinutes}m`
      : undefined;

    await this.emailService.sendTemplatedEmail(recipient.email, dto.subject, 'broadcast', {
      recipientName: recipient.name || 'there',
      message: dto.message,
      eventTitle: dto.eventTitle,
      eventStartTime: dto.eventStartTime
        ? new Date(dto.eventStartTime).toLocaleString()
        : undefined,
      eventDuration: durationDisplay,
      eventEndTime: eventEndTime ? new Date(eventEndTime).toLocaleString() : undefined,
      eventMeetingLink: dto.eventMeetingLink,
      eventDescription: dto.eventDescription,
      googleCalendarLink: calendarLinks.google,
      outlookCalendarLink: calendarLinks.outlook,
      icsDownloadLink: calendarLinks.ics,
      currentYear: new Date().getFullYear(),
    });
  }

  private generateCalendarLinks(
    dto: CreateBroadcastDto,
    eventEndTime?: string
  ): {
    google: string | null;
    outlook: string | null;
    ics: string | null;
  } {
    if (!dto.eventTitle || !dto.eventStartTime) {
      return { google: null, outlook: null, ics: null };
    }

    const start = new Date(dto.eventStartTime);
    // Use provided eventEndTime or calculate from duration
    let end: Date;
    if (eventEndTime) {
      end = new Date(eventEndTime);
    } else if (dto.eventDuration) {
      const durationMinutes = parseInt(dto.eventDuration, 10);
      if (!isNaN(durationMinutes)) {
        end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      } else {
        return { google: null, outlook: null, ics: null };
      }
    } else {
      return { google: null, outlook: null, ics: null };
    }

    // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
    const formatGoogleDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: dto.eventTitle,
      dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    });
    if (dto.eventDescription) {
      googleParams.append('details', dto.eventDescription);
    }
    if (dto.eventMeetingLink) {
      googleParams.append('location', dto.eventMeetingLink);
    }

    const googleLink = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

    // Outlook calendar link
    const outlookParams = new URLSearchParams({
      subject: dto.eventTitle,
      startdt: start.toISOString(),
      enddt: end.toISOString(),
    });
    if (dto.eventDescription) {
      outlookParams.append('body', dto.eventDescription);
    }
    if (dto.eventMeetingLink) {
      outlookParams.append('location', dto.eventMeetingLink);
    }

    const outlookLink = `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;

    // ICS file data (for download)
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SOS Academy//Broadcast//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatGoogleDate(start)}`,
      `DTEND:${formatGoogleDate(end)}`,
      `SUMMARY:${dto.eventTitle}`,
      dto.eventDescription ? `DESCRIPTION:${dto.eventDescription.replace(/\n/g, '\\n')}` : '',
      dto.eventMeetingLink ? `LOCATION:${dto.eventMeetingLink}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');

    // Create a data URL for ICS download
    const icsBlob = Buffer.from(icsContent).toString('base64');
    const icsLink = `data:text/calendar;charset=utf-8;base64,${icsBlob}`;

    return {
      google: googleLink,
      outlook: outlookLink,
      ics: icsLink,
    };
  }
}
