import { CalendarEventType } from '@sos-academy/shared';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateCalendarEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsNotEmpty()
  @IsEnum(CalendarEventType)
  eventType: CalendarEventType;

  @IsNotEmpty()
  @IsMongoId()
  organizer: string;

  @IsOptional()
  @IsMongoId({ each: true })
  attendees?: string[];

  @IsOptional()
  @IsMongoId()
  community?: string;

  @IsOptional()
  @IsMongoId()
  project?: string;

  @IsOptional()
  @IsUrl()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrencePattern?: string;
}
