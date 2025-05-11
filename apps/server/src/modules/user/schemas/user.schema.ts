import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MembershipLevel, UserRole } from '@sos-academy/shared';

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
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: MembershipLevel,
    default: MembershipLevel.GENIN,
    required: function () {
      return this.role === UserRole.MEMBER || this.role === UserRole.MENTOR;
    },
  })
  membershipLevel: MembershipLevel;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Community' }],
    default: [],
  })
  communities: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Project' }],
    default: [],
  })
  projects: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  bio: string;

  @Prop()
  profilePicture: string;

  @Prop({ default: 0 })
  experiencePoints: number;

  @Prop({ default: [] })
  skills: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
