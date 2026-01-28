import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BookingStatus } from '../interfaces/booking-status.enum';

export type BookingDocument = Booking & Document;

/**
 * Booking schema for mentor-student sessions
 * Follows single responsibility principle with focused validation
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Booking {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  mentorId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  studentId: Types.ObjectId;

  @Prop({
    required: true,
    validate: {
      validator: function (date: Date): boolean {
        return date > new Date();
      },
      message: 'Booking date must be in the future',
    },
  })
  requestedDate: Date;

  @Prop({
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'],
  })
  startTime: string;

  @Prop({
    required: true,
    enum: [30, 60, 90],
    default: 60,
  })
  duration: number;

  @Prop({
    required: true,
    minlength: [3, 'Topic must be at least 3 characters'],
    maxlength: [100, 'Topic cannot exceed 100 characters'],
    trim: true,
  })
  topic: string;

  @Prop({
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true,
  })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.REQUESTED,
    index: true,
  })
  status: BookingStatus;

  @Prop({
    validate: {
      validator: function (link: string): boolean {
        if (!link) return true;
        return /^https?:\/\/.+/.test(link);
      },
      message: 'Invalid meeting link format',
    },
  })
  meetingLink: string;

  @Prop({
    maxlength: [200, 'Rejection reason cannot exceed 200 characters'],
    trim: true,
  })
  rejectionReason: string;

  @Prop({
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters'],
    trim: true,
  })
  cancellationReason: string;

  @Prop({
    maxlength: [500, 'Mentor notes cannot exceed 500 characters'],
    trim: true,
  })
  mentorNotes: string;

  @Prop({
    maxlength: [500, 'Student notes cannot exceed 500 characters'],
    trim: true,
  })
  studentNotes: string;

  /**
   * Virtual for calculating end time
   */
  get endTime(): string {
    if (!this.startTime || !this.duration) return '';

    const [hours, minutes] = this.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + this.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  /**
   * Check if booking can be cancelled (2+ hours before start)
   */
  canBeCancelled(): boolean {
    if (
      [BookingStatus.CANCELLED, BookingStatus.COMPLETED, BookingStatus.REJECTED].includes(
        this.status
      )
    ) {
      return false;
    }

    const bookingDateTime = new Date(this.requestedDate);
    const [hours, minutes] = this.startTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const hoursDifference = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursDifference >= 2;
  }
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.virtual('endTime').get(function () {
  if (!this.startTime || !this.duration) return '';

  const [hours, minutes] = this.startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + this.duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
});

BookingSchema.methods.canBeCancelled = function (): boolean {
  if (
    [BookingStatus.CANCELLED, BookingStatus.COMPLETED, BookingStatus.REJECTED].includes(this.status)
  ) {
    return false;
  }

  const bookingDateTime = new Date(this.requestedDate);
  const [hours, minutes] = this.startTime.split(':').map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const hoursDifference = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursDifference >= 2;
};
