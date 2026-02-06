import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BroadcastRecipientType } from '../dto/create-broadcast.dto';

export type BroadcastDocument = Broadcast & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.__v = undefined;
      return ret;
    },
  },
})
export class Broadcast {
  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: BroadcastRecipientType })
  recipientType: BroadcastRecipientType;

  @Prop({ required: false })
  communitySlug?: string;

  @Prop({ type: [String], default: [] })
  userIds?: string[];

  @Prop({ required: false })
  inactiveDays?: string;

  @Prop({ required: false })
  eventTitle?: string;

  @Prop({ required: false })
  eventStartTime?: string;

  @Prop({ required: false })
  eventEndTime?: string;

  @Prop({ required: false })
  eventMeetingLink?: string;

  @Prop({ required: false })
  eventDescription?: string;

  @Prop({ required: false })
  scheduledAt?: Date;

  @Prop({ default: 0 })
  sentCount: number;

  @Prop({ default: false })
  scheduled: boolean;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ type: Date, default: Date.now })
  sentAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy?: MongooseSchema.Types.ObjectId;
}

export const BroadcastSchema = SchemaFactory.createForClass(Broadcast);
