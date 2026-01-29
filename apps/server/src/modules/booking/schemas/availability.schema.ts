import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AvailabilityDocument = Availability & Document;

/**
 * Time slot definition for availability
 */
@Schema({ _id: false })
export class TimeSlot {
  @Prop({
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'],
  })
  startTime: string;

  @Prop({
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'],
  })
  endTime: string;
}

const TimeSlotSchema = SchemaFactory.createForClass(TimeSlot);

/**
 * Weekly schedule entry - only includes days when mentor is available
 */
@Schema({ _id: false })
export class WeeklyScheduleEntry {
  @Prop({
    required: true,
    min: 0,
    max: 6,
    type: Number,
  })
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @Prop({
    type: [TimeSlotSchema],
    required: true,
    validate: {
      validator: function (slots: TimeSlot[]) {
        return slots && slots.length > 0;
      },
      message: 'At least one time slot is required',
    },
  })
  timeSlots: TimeSlot[];
}

const WeeklyScheduleEntrySchema = SchemaFactory.createForClass(WeeklyScheduleEntry);

/**
 * Date-specific availability override
 */
@Schema({ _id: false })
export class DateOverride {
  @Prop({
    required: true,
    type: Date,
  })
  date: Date;

  @Prop({
    type: [TimeSlotSchema],
    default: [],
  })
  timeSlots: TimeSlot[];

  @Prop({
    maxlength: 200,
    trim: true,
  })
  reason?: string;
}

const DateOverrideSchema = SchemaFactory.createForClass(DateOverride);

/**
 * Mentor availability schema
 * Defines when a mentor is available for bookings
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
export class Availability {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  mentorId: Types.ObjectId;

  /**
   * Weekly recurring schedule
   * Only includes days when the mentor is available
   */
  @Prop({
    type: [WeeklyScheduleEntrySchema],
    default: [],
  })
  weeklySchedule: WeeklyScheduleEntry[];

  /**
   * Date-specific overrides
   * Can be used to mark dates as unavailable or modify availability
   */
  @Prop({
    type: [DateOverrideSchema],
    default: [],
  })
  dateOverrides: DateOverride[];

  /**
   * Mentor's timezone (IANA timezone identifier)
   * e.g., "America/New_York", "Europe/London", "Asia/Tokyo"
   */
  @Prop({
    required: true,
    default: 'UTC',
  })
  timezone: string;

  /**
   * Minimum advance booking time in hours
   * Bookings must be made at least this many hours in advance
   */
  @Prop({
    default: 24,
    min: 0,
  })
  minAdvanceBookingHours: number;

  /**
   * Maximum advance booking time in days
   * Bookings cannot be made more than this many days in advance
   */
  @Prop({
    default: 30,
    min: 1,
  })
  maxAdvanceBookingDays: number;

  /**
   * Buffer time in minutes between bookings
   * Automatically adds buffer after each booking
   */
  @Prop({
    default: 15,
    min: 0,
  })
  bufferTimeMinutes: number;

  /**
   * Check if a specific date and time is available
   */
  isTimeSlotAvailable(date: Date, startTime: string, duration: number): boolean {
    const dateOverride = this.dateOverrides.find(
      (override) => override.date.toDateString() === date.toDateString()
    );

    let availableSlots: TimeSlot[] = [];

    if (dateOverride) {
      availableSlots = dateOverride.timeSlots;
    } else {
      const dayOfWeek = date.getDay();
      const weeklyEntry = this.weeklySchedule.find((entry) => entry.dayOfWeek === dayOfWeek);
      if (weeklyEntry) {
        availableSlots = weeklyEntry.timeSlots;
      }
    }

    if (availableSlots.length === 0) {
      return false;
    }

    const requestedStart = this.timeToMinutes(startTime);
    const requestedEnd = requestedStart + duration;

    return availableSlots.some((slot) => {
      const slotStart = this.timeToMinutes(slot.startTime);
      const slotEnd = this.timeToMinutes(slot.endTime);
      return requestedStart >= slotStart && requestedEnd <= slotEnd;
    });
  }

  /**
   * Get all available time slots for a specific date
   */
  getAvailableSlotsForDate(date: Date): TimeSlot[] {
    const dateOverride = this.dateOverrides.find(
      (override) => override.date.toDateString() === date.toDateString()
    );

    if (dateOverride) {
      return dateOverride.timeSlots;
    }

    const dayOfWeek = date.getDay();
    const weeklyEntry = this.weeklySchedule.find((entry) => entry.dayOfWeek === dayOfWeek);

    return weeklyEntry ? weeklyEntry.timeSlots : [];
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);

AvailabilitySchema.methods.isTimeSlotAvailable = function (
  date: Date,
  startTime: string,
  duration: number
): boolean {
  const dateOverride = this.dateOverrides.find(
    (override: DateOverride) => override.date.toDateString() === date.toDateString()
  );

  let availableSlots: TimeSlot[] = [];

  if (dateOverride) {
    availableSlots = dateOverride.timeSlots;
  } else {
    const dayOfWeek = date.getDay();
    const weeklyEntry = this.weeklySchedule.find(
      (entry: WeeklyScheduleEntry) => entry.dayOfWeek === dayOfWeek
    );
    if (weeklyEntry) {
      availableSlots = weeklyEntry.timeSlots;
    }
  }

  if (availableSlots.length === 0) {
    return false;
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const requestedStart = timeToMinutes(startTime);
  const requestedEnd = requestedStart + duration;

  return availableSlots.some((slot: TimeSlot) => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    return requestedStart >= slotStart && requestedEnd <= slotEnd;
  });
};

AvailabilitySchema.methods.getAvailableSlotsForDate = function (date: Date): TimeSlot[] {
  const dateOverride = this.dateOverrides.find(
    (override: DateOverride) => override.date.toDateString() === date.toDateString()
  );

  if (dateOverride) {
    return dateOverride.timeSlots;
  }

  const dayOfWeek = date.getDay();
  const weeklyEntry = this.weeklySchedule.find(
    (entry: WeeklyScheduleEntry) => entry.dayOfWeek === dayOfWeek
  );

  return weeklyEntry ? weeklyEntry.timeSlots : [];
};
