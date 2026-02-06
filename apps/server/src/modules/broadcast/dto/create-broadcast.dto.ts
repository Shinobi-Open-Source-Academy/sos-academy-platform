import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsDateString, ValidateIf } from 'class-validator';

export enum BroadcastRecipientType {
  ALL_USERS = 'ALL_USERS',
  COMMUNITY = 'COMMUNITY',
  MENTORS = 'MENTORS',
  INACTIVE_USERS = 'INACTIVE_USERS',
  SPECIFIC_USERS = 'SPECIFIC_USERS',
}

export class CreateBroadcastDto {
  @ApiProperty({ description: 'Subject of the broadcast message' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Message content (HTML supported)' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Type of recipients',
    enum: BroadcastRecipientType,
    example: BroadcastRecipientType.COMMUNITY,
  })
  @IsEnum(BroadcastRecipientType)
  recipientType: BroadcastRecipientType;

  @ApiProperty({
    description: 'Community slug (required if recipientType is COMMUNITY)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.recipientType === BroadcastRecipientType.COMMUNITY)
  @IsNotEmpty()
  communitySlug?: string;

  @ApiProperty({
    description: 'Specific user IDs (required if recipientType is SPECIFIC_USERS)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ValidateIf((o) => o.recipientType === BroadcastRecipientType.SPECIFIC_USERS)
  @IsNotEmpty()
  userIds?: string[];

  @ApiProperty({
    description: 'Days of inactivity threshold (required if recipientType is INACTIVE_USERS)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.recipientType === BroadcastRecipientType.INACTIVE_USERS)
  @IsNotEmpty()
  inactiveDays?: string;

  @ApiProperty({
    description: 'Event title (optional, for calendar links)',
    required: false,
  })
  @IsOptional()
  @IsString()
  eventTitle?: string;

  @ApiProperty({
    description: 'Event start date/time (ISO 8601 format, optional)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  eventStartTime?: string;

  @ApiProperty({
    description: 'Event end date/time (ISO 8601 format, optional)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  eventEndTime?: string;

  @ApiProperty({
    description: 'Event meeting link (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  eventMeetingLink?: string;

  @ApiProperty({
    description: 'Event description (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  eventDescription?: string;

  @ApiProperty({
    description: 'Schedule send date/time (ISO 8601 format, optional. If not provided, sends immediately)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
