import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CommunityMembershipDocument = CommunityMembership & Document;

export enum CommunityRole {
  MEMBER = 'MEMBER',
  MENTOR = 'MENTOR',
  KAGE = 'KAGE',
}

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
export class CommunityMembership {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Community',
    required: true,
  })
  community: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: CommunityRole,
    default: CommunityRole.MEMBER,
  })
  role: CommunityRole;

  @Prop({
    type: Date,
    default: Date.now,
  })
  joinedAt: Date;

  @Prop({
    type: Date,
    required: false,
  })
  leftAt?: Date;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: String,
    required: false,
  })
  invitationToken?: string;

  @Prop({
    type: Date,
    required: false,
  })
  invitationExpiresAt?: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  invitedBy?: MongooseSchema.Types.ObjectId;

  @Prop({
    default: 0,
  })
  contributionScore: number;

  @Prop({
    type: [String],
    default: [],
  })
  badges: string[];
}

export const CommunityMembershipSchema = SchemaFactory.createForClass(CommunityMembership);

// Add compound indexes for fast lookups
CommunityMembershipSchema.index({ user: 1, community: 1 }, { unique: true });
CommunityMembershipSchema.index({ community: 1, role: 1 });
CommunityMembershipSchema.index({ community: 1, isActive: 1 });
CommunityMembershipSchema.index({ user: 1, isActive: 1 });
CommunityMembershipSchema.index({ joinedAt: -1 });
CommunityMembershipSchema.index({ contributionScore: -1 });
