import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CommunityDocument = Community & Document;

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
export class Community {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  kage: MongooseSchema.Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  mentors: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  members: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Project' }],
    default: [],
  })
  projects: MongooseSchema.Types.ObjectId[];

  @Prop()
  logo: string;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;

  // Denormalized counters for performance
  @Prop({ default: 0 })
  memberCount: number;

  @Prop({ default: 0 })
  mentorCount: number;

  @Prop({ default: 0 })
  activeProjectCount: number;

  @Prop({ default: 0 })
  totalProjectCount: number;

  @Prop({ default: 0 })
  totalContributions: number;
}

export const CommunitySchema = SchemaFactory.createForClass(Community);

// Add indexes for performance
CommunitySchema.index({ name: 1 }, { unique: true });
CommunitySchema.index({ isActive: 1 });
CommunitySchema.index({ kage: 1 });
CommunitySchema.index({ memberCount: -1 });
CommunitySchema.index({ activeProjectCount: -1 });
CommunitySchema.index({ tags: 1 });
