import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CalendarEventType } from '@sos-academy/shared';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CalendarEventDocument = CalendarEvent & Document;

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
export class CalendarEvent {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({
    type: String,
    enum: CalendarEventType,
    required: true,
  })
  eventType: CalendarEventType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  organizer: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  attendees: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Community',
  })
  community: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Project',
  })
  project: MongooseSchema.Types.ObjectId;

  @Prop()
  meetingLink: string;

  @Prop()
  location: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isRecurring: boolean;

  @Prop()
  recurrencePattern: string;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
