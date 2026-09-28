import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

// An empty field clears the value
const emptyToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export class UpdateMentorDto {
  @ApiProperty({
    description: 'Mentor title/role for public display',
    example: 'Senior Backend Engineer',
    required: false,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string | null;

  @ApiProperty({
    description: 'Mentor description/bio for public display',
    example: 'Senior Backend Engineer with 7+ years of experience...',
    required: false,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiProperty({
    description: 'GitHub profile URL',
    example: 'https://github.com/username',
    required: false,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  github?: string | null;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/username',
    required: false,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedin?: string | null;

  @ApiProperty({
    description: 'Twitter/X profile URL',
    example: 'https://x.com/username',
    required: false,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  twitter?: string | null;

  @ApiProperty({
    description: 'Personal website URL',
    example: 'https://example.com',
    required: false,
  })
  @Transform(emptyToNull)
  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string | null;
}
