import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../interfaces/booking-status.enum';

/**
 * Response DTO for booking data
 * Formats output with populated user information
 */
export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  mentorId: any;

  @ApiProperty()
  studentId: any;

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

  @ApiProperty({ enum: BookingStatus })
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
