import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MentorAvailabilitySlotDocument = MentorAvailabilitySlot & Document;

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
export class MentorAvailabilitySlot {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  mentor: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const MentorAvailabilitySlotSchema = SchemaFactory.createForClass(MentorAvailabilitySlot);
