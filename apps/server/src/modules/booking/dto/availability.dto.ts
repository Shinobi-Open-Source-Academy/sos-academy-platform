import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for time slot
 */
export class TimeSlotDto {
  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '09:00',
  })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '17:00',
  })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime: string;
}

/**
 * DTO for weekly schedule entry
 */
export class WeeklyScheduleEntryDto {
  @ApiProperty({
    description: 'Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)',
    minimum: 0,
    maximum: 6,
    example: 1,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({
    description: 'Available time slots for this day',
    type: [TimeSlotDto],
    example: [
      { startTime: '09:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '18:00' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[];
}

/**
 * DTO for date-specific override
 */
export class DateOverrideDto {
  @ApiProperty({
    description: 'Specific date for override',
    example: '2024-12-25',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Time slots for this date (empty array means unavailable)',
    type: [TimeSlotDto],
    required: false,
    example: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[] = [];

  @ApiProperty({
    description: 'Reason for override',
    required: false,
    example: 'Holiday',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO for setting mentor availability
 */
export class SetAvailabilityDto {
  @ApiProperty({
    description: 'Weekly recurring schedule (only days when available)',
    type: [WeeklyScheduleEntryDto],
    example: [
      {
        dayOfWeek: 1,
        timeSlots: [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '18:00' },
        ],
      },
      {
        dayOfWeek: 3,
        timeSlots: [{ startTime: '10:00', endTime: '16:00' }],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyScheduleEntryDto)
  weeklySchedule: WeeklyScheduleEntryDto[];

  @ApiProperty({
    description: 'Date-specific overrides',
    type: [DateOverrideDto],
    required: false,
    example: [
      {
        date: '2024-12-25',
        timeSlots: [],
        reason: 'Christmas Holiday',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DateOverrideDto)
  dateOverrides?: DateOverrideDto[];

  @ApiProperty({
    description: 'Timezone (IANA identifier)',
    example: 'America/New_York',
    default: 'UTC',
  })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @ApiProperty({
    description: 'Minimum hours in advance for booking',
    example: 24,
    default: 24,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAdvanceBookingHours?: number = 24;

  @ApiProperty({
    description: 'Maximum days in advance for booking',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAdvanceBookingDays?: number = 30;

  @ApiProperty({
    description: 'Buffer time in minutes between bookings',
    example: 15,
    default: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferTimeMinutes?: number = 15;
}

/**
 * DTO for updating mentor availability
 */
export class UpdateAvailabilityDto extends SetAvailabilityDto {}

/**
 * DTO for querying available slots
 */
export class GetAvailableSlotsDto {
  @ApiProperty({
    description: 'Start date for slot query',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for slot query',
    example: '2024-01-07',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Required duration in minutes',
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(180)
  duration?: number = 60;
}

/**
 * Response DTO for availability
 */
export class AvailabilityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  mentorId: string;

  @ApiProperty({ type: [WeeklyScheduleEntryDto] })
  weeklySchedule: WeeklyScheduleEntryDto[];

  @ApiProperty({ type: [DateOverrideDto] })
  dateOverrides: DateOverrideDto[];

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  minAdvanceBookingHours: number;

  @ApiProperty()
  maxAdvanceBookingDays: number;

  @ApiProperty()
  bufferTimeMinutes: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * Response DTO for available slots
 */
export class AvailableSlotDto {
  @ApiProperty({
    description: 'Date of the available slot',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Day of week (0=Sunday, 6=Saturday)',
    example: 1,
  })
  dayOfWeek: number;

  @ApiProperty({
    description: 'Available time slots for this date',
    type: [TimeSlotDto],
  })
  timeSlots: TimeSlotDto[];

  @ApiProperty({
    description: 'Indicates if this is from an override',
    example: false,
  })
  isOverride: boolean;
}

/**
 * Response DTO for available slots query
 */
export class AvailableSlotsResponseDto {
  @ApiProperty({
    description: 'Mentor ID',
  })
  mentorId: string;

  @ApiProperty({
    description: 'Mentor timezone',
  })
  timezone: string;

  @ApiProperty({
    description: 'List of available slots',
    type: [AvailableSlotDto],
  })
  slots: AvailableSlotDto[];
}

/**
 * DTO for updating a specific day's availability
 */
export class UpdateDayAvailabilityDto {
  @ApiProperty({
    description: 'Time slots for this day (null or empty to remove the day)',
    type: [TimeSlotDto],
    required: false,
    nullable: true,
    example: [
      { startTime: '09:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '18:00' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots?: TimeSlotDto[] | null;
}

/**
 * DTO for updating a date override
 */
export class UpdateDateOverrideDto {
  @ApiProperty({
    description:
      'Time slots for this date (null to remove override, empty array to mark unavailable)',
    type: [TimeSlotDto],
    required: false,
    nullable: true,
    example: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots?: TimeSlotDto[] | null;

  @ApiProperty({
    description: 'Reason for override',
    required: false,
    example: 'Holiday',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
