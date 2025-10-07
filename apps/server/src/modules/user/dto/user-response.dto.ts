import { ApiProperty } from '@nestjs/swagger';
import { MembershipLevel, UserRole, UserStatus } from '@sos-academy/shared';
import { Exclude, Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '507f1f77bcf86cd799439011',
  })
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @Expose()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.MEMBER,
  })
  @Expose()
  role: UserRole;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @Expose()
  status: UserStatus;

  @ApiProperty({
    description: 'User membership level',
    enum: MembershipLevel,
    example: MembershipLevel.GENIN,
  })
  @Expose()
  membershipLevel: MembershipLevel;

  @ApiProperty({
    description: 'Array of community IDs the user belongs to',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  @Expose()
  @Transform(({ value }) => value?.map((id: Types.ObjectId) => id.toString()))
  communities: string[];

  @ApiProperty({
    description: 'Array of project IDs the user is involved in',
    type: [String],
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
  })
  @Expose()
  @Transform(({ value }) => value?.map((id: Types.ObjectId) => id.toString()))
  projects: string[];

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'User biography',
    example: 'Full-stack developer passionate about open source',
  })
  @Expose()
  bio: string;

  @ApiProperty({
    description: 'URL to user profile picture',
    example: 'https://example.com/avatar.jpg',
  })
  @Expose()
  profilePicture: string;

  @ApiProperty({
    description: 'User experience points',
    example: 150,
  })
  @Expose()
  experiencePoints: number;

  @ApiProperty({
    description: 'Array of user skills',
    type: [String],
    example: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
  })
  @Expose()
  skills: string[];

  @ApiProperty({
    description: 'Array of user interests',
    type: [String],
    example: ['Web Development', 'Open Source', 'Machine Learning'],
  })
  @Expose()
  interests: string[];

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
