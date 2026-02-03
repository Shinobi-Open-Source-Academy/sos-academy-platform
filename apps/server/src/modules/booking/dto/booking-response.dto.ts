import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../interfaces/booking-status.enum';

/**
 * Response DTO for booking data
 * Formats output with populated user information
 */
export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'Mentor user ID or populated mentor object',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  mentorId: string | Record<string, any>;

  @ApiProperty({
    description: 'Student user ID or populated student object',
    example: '507f1f77bcf86cd799439011',
    type: 'string',
  })
  studentId: string | Record<string, any>;

  @ApiProperty()
  requestedDate: Date;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  endTime?: string;

  @ApiProperty()
  topic: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({
    enum: BookingStatus,
    enumName: 'BookingStatus',
    description: 'Current status of the booking',
  })
  status: BookingStatus;

  @ApiProperty({ required: false })
  meetingLink?: string;

  @ApiProperty({ required: false })
  rejectionReason?: string;

  @ApiProperty({ required: false })
  mentorNotes?: string;

  @ApiProperty({ required: false })
  studentNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
