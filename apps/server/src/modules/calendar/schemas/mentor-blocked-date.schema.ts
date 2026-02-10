import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MentorBlockedDateDocument = MentorBlockedDate & Document;

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
export class MentorBlockedDate {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  mentor: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop()
  reason?: string;
}

export const MentorBlockedDateSchema = SchemaFactory.createForClass(MentorBlockedDate);
