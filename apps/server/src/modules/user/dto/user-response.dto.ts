import { Exclude, Expose, Transform } from 'class-transformer';
import { MembershipLevel, UserRole, UserStatus } from '@sos-academy/shared';
import { Types } from 'mongoose';

export class UserResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Expose()
  role: UserRole;

  @Expose()
  status: UserStatus;

  @Expose()
  membershipLevel: MembershipLevel;

  @Expose()
  @Transform(({ value }) => value?.map((id: Types.ObjectId) => id.toString()))
  communities: string[];

  @Expose()
  @Transform(({ value }) => value?.map((id: Types.ObjectId) => id.toString()))
  projects: string[];

  @Expose()
  isActive: boolean;

  @Expose()
  bio: string;

  @Expose()
  profilePicture: string;

  @Expose()
  experiencePoints: number;

  @Expose()
  skills: string[];

  @Expose()
  interests: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
