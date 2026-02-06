import { ApiProperty } from '@nestjs/swagger';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

class SocialLinksDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  github?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  linkedin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  twitter?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  website?: string;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'] as const)) {
  @ApiProperty({
    description: 'Mentor title/role for public display',
    example: 'Senior Backend Engineer',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: 'Mentor description for public display',
    example: 'Senior Backend Engineer with 7+ years of experience...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Social media links',
    required: false,
    type: SocialLinksDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;
}
