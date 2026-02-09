import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateMentorDto {
  @ApiProperty({
    description: 'Mentor description/bio for public display',
    example: 'Senior Backend Engineer with 7+ years of experience...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'GitHub profile URL',
    example: 'https://github.com/username',
    required: false,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  github?: string;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/username',
    required: false,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedin?: string;

  @ApiProperty({
    description: 'Twitter/X profile URL',
    example: 'https://x.com/username',
    required: false,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  twitter?: string;

  @ApiProperty({
    description: 'Personal website URL',
    example: 'https://example.com',
    required: false,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;
}
