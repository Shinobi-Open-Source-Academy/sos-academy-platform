import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class ApproveMentorDto {
  @ApiProperty({
    description: 'Optional custom message to include in the approval email',
    example: 'We are excited to have you lead our React community.',
    required: false,
  })
  @IsOptional()
  @IsString()
  customMessage?: string;

  @ApiProperty({
    description: 'IDs of communities the mentor will lead',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
    required: false,
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  communityIds?: string[];
}
