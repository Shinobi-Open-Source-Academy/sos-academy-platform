import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO for creating a new booking request
 * Validates all input according to business rules
 */
export class CreateBookingDto {
  @ApiProperty({
    description: 'Student user ID (for testing only, remove in production)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid student ID format' })
  studentId?: string;

  @ApiProperty({
    description: 'Mentor user ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid mentor ID format' })
  @IsNotEmpty({ message: 'Mentor ID is required' })
  mentorId: string;

  @ApiProperty({
    description: 'Requested date for the booking session',
    example: '2024-12-25',
  })
  @IsDateString({}, { message: 'Invalid date format' })
  @IsNotEmpty({ message: 'Booking date is required' })
  requestedDate: string;

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '14:00',
  })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  startTime: string;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    enum: [30, 60, 90],
    default: 60,
  })
  @IsIn([30, 60, 90], {
    message: 'Duration must be 30, 60, or 90 minutes',
  })
  duration: number = 60;

  @ApiProperty({
    description: 'Topic or subject of the mentoring session',
    minLength: 3,
    maxLength: 100,
    example: 'React Performance Optimization',
  })
  @IsString({ message: 'Topic must be a string' })
  @IsNotEmpty({ message: 'Topic is required' })
  @MinLength(3, { message: 'Topic must be at least 3 characters' })
  @MaxLength(100, { message: 'Topic cannot exceed 100 characters' })
  topic: string;

  @ApiProperty({
    description: 'Additional details about the session',
    maxLength: 500,
    required: false,
    example: 'I need help with optimizing my React app performance',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Notes from the student',
    maxLength: 500,
    required: false,
    example: 'I have basic React knowledge',
  })
  @IsOptional()
  @IsString({ message: 'Student notes must be a string' })
  @MaxLength(500, { message: 'Student notes cannot exceed 500 characters' })
  studentNotes?: string;
}
