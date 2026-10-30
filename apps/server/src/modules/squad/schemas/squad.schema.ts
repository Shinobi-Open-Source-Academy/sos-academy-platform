import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SquadDocument = Squad & Document;

export const DEFAULT_SQUAD_CAPACITY = 5;

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
export class Squad {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  mentor: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Community',
    required: true,
  })
  community: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  members: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: Number,
    min: 1,
    default: DEFAULT_SQUAD_CAPACITY,
  })
  capacity: number;

  @Prop({
    default: true,
  })
  isActive: boolean;
}

export const SquadSchema = SchemaFactory.createForClass(Squad);

// Add compound indexes for fast lookups
SquadSchema.index({ mentor: 1, community: 1 });
SquadSchema.index({ members: 1, isActive: 1 });
SquadSchema.index({ community: 1, isActive: 1 });
