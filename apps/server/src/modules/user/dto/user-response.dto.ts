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
    example: 'Chan Kim',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'chan.kim@example.com',
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
    description: 'Array of communities the user belongs to',
    type: [Object],
    example: [{ name: 'JavaScript', slug: 'javascript' }],
  })
  @Expose()
  @Transform(({ value }) =>
    value?.map((c: { _id?: Types.ObjectId; name?: string; slug?: string } | Types.ObjectId) =>
      typeof c === 'object' && 'name' in c ? { name: c.name, slug: c.slug } : { id: c.toString() }
    )
  )
  communities: { name: string; slug: string }[];

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

  @ApiProperty({
    description: 'Mentor areas of expertise',
    example: 'React, Node.js, TypeScript, System Design',
    required: false,
  })
  @Expose()
  expertise?: string;

  @ApiProperty({
    description: 'Mentor motivation for joining',
    example: 'I want to help new developers grow in the open-source community.',
    required: false,
  })
  @Expose()
  motivation?: string;

  @ApiProperty({
    description: 'GitHub profile information',
    required: false,
  })
  @Expose()
  githubProfile?: {
    login: string;
    avatarUrl?: string;
    htmlUrl?: string;
    publicRepos?: number;
    followers?: number;
    bio?: string;
  };

  @ApiProperty({
    description: 'Mentor title/role for public display',
    example: 'Senior Backend Engineer',
    required: false,
  })
  @Expose()
  title?: string;

  @ApiProperty({
    description: 'Mentor description for public display',
    example: 'Senior Backend Engineer with 7+ years of experience...',
    required: false,
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Social media and profile links',
    required: false,
  })
  @Expose()
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
