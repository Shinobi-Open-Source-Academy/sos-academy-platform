import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { BookingStatus } from '../interfaces/booking-status.enum';

/**
 * DTO for updating booking status and details
 * Used for approval, rejection, and updates
 */
export class UpdateBookingDto {
  @ApiProperty({
    description: 'Updated booking status',
    enum: BookingStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus, { message: 'Invalid booking status' })
  status?: BookingStatus;

  @ApiProperty({
    description: 'Meeting link for approved bookings',
    required: false,
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid meeting link URL' })
  meetingLink?: string;

  @ApiProperty({
    description: 'Reason for rejection',
    maxLength: 200,
    required: false,
    example: 'Not available at this time',
  })
  @IsOptional()
  @IsString({ message: 'Rejection reason must be a string' })
  @MaxLength(200, { message: 'Rejection reason cannot exceed 200 characters' })
  rejectionReason?: string;

  @ApiProperty({
    description: 'Notes from mentor',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Mentor notes must be a string' })
  @MaxLength(500, { message: 'Mentor notes cannot exceed 500 characters' })
  mentorNotes?: string;
}

/**
 * DTO for approving a booking
 */
export class ApproveBookingDto {
  @ApiProperty({
    description: 'Mentor ID (for testing only, remove in production)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  mentorId?: string;

  @ApiProperty({
    description: 'Meeting link for the session',
    example: 'https://meet.google.com/abc-defg-hij',
  })
  @IsUrl({}, { message: 'Invalid meeting link URL' })
  meetingLink: string;

  @ApiProperty({
    description: 'Optional notes from mentor',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  mentorNotes?: string;
}

/**
 * DTO for rejecting a booking
 */
export class RejectBookingDto {
  @ApiProperty({
    description: 'Mentor ID (for testing only, remove in production)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  mentorId?: string;

  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Schedule conflict',
  })
  @IsString({ message: 'Rejection reason is required' })
  @MaxLength(200, { message: 'Rejection reason cannot exceed 200 characters' })
  reason: string;
}

/**
 * DTO for cancelling a booking
 */
export class CancelBookingDto {
  @ApiProperty({
    description: 'User ID (student or mentor) - for testing only, remove in production',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'Emergency came up, need to reschedule',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Cancellation reason cannot exceed 200 characters' })
  cancellationReason?: string;
}
