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
  @Prop({
    required: false,
    minlength: 2,
    maxlength: 50,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  })
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

  @Prop({
    default: [],
    required: false,
    type: [String],
    validate: {
      validator: function (skills: string[]) {
        return skills.length <= 20;
      },
      message: 'Maximum 20 skills allowed',
    },
  })
  skills: string[];

  @Prop({
    default: [],
    required: false,
    type: [String],
    validate: {
      validator: function (interests: string[]) {
        return interests.length <= 15;
      },
      message: 'Maximum 15 interests allowed',
    },
  })
  interests: string[];

  @Prop({
    type: String,
    enum: ['subscription', 'mentor-application'],
    default: 'subscription',
    required: false,
  })
  source: 'subscription' | 'mentor-application';

  @Prop({
    type: {
      login: { type: String, required: true },
      avatarUrl: String,
      htmlUrl: String,
      publicRepos: Number,
      followers: Number,
      following: Number,
      createdAt: Date,
      lastUpdated: { type: Date, default: Date.now },
      email: String,
      bio: String,
      location: String,
      company: String,
      blog: String,
      twitterUsername: String,
      githubId: Number,
    },
    required: false,
    _id: false,
  })
  githubProfile?: {
    login: string;
    avatarUrl?: string;
    htmlUrl?: string;
    publicRepos?: number;
    followers?: number;
    following?: number;
    createdAt?: Date;
    lastUpdated: Date;
    email?: string;
    bio?: string;
    location?: string;
    company?: string;
    blog?: string;
    twitterUsername?: string;
    githubId?: number;
  };

  @Prop({ required: false })
  expertise?: string;

  @Prop({ required: false })
  motivation?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add critical indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ communities: 1 });
UserSchema.index({ 'githubProfile.login': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ source: 1, status: 1 });
