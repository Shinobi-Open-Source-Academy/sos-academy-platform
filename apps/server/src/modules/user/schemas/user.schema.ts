import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MembershipLevel, UserRole, UserStatus } from '@sos-academy/shared';

export type UserDocument = User & Document;

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
export class User {
  @Prop({ required: false })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.MEMBER,
    required: false,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: UserStatus,
    default: UserStatus.INACTIVE,
    required: false,
  })
  status: UserStatus;

  @Prop({
    type: String,
    enum: MembershipLevel,
    default: MembershipLevel.GENIN,
    required: false,
  })
  membershipLevel: MembershipLevel;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Community' }],
    default: [],
    required: false,
  })
  communities: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [String],
    default: [],
    required: false,
  })
  communityIds: string[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Project' }],
    default: [],
    required: false,
  })
  projects: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false, required: false })
  isActive: boolean;

  @Prop({ required: false })
  bio: string;

  @Prop({ required: false })
  profilePicture: string;

  @Prop({ default: 0, required: false })
  experiencePoints: number;

  @Prop({ default: [], required: false })
  skills: string[];

  @Prop({ default: [], required: false })
  interests: string[];

  @Prop({ 
    type: String,
    enum: ['subscription', 'mentor-application'],
    default: 'subscription',
    required: false,
  })
  source: 'subscription' | 'mentor-application';

  @Prop({ 
    type: Object,
    required: false,
  })
  githubProfile?: {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
  };

  @Prop({ required: false })
  expertise?: string;

  @Prop({ required: false })
  motivation?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
