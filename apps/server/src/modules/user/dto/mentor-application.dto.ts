import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MentorApplicationDto {
  @ApiProperty({
    description: 'Full name of the mentor applicant',
    example: 'Jane Smith',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the mentor applicant',
    example: 'jane.smith@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Areas of expertise',
    example: 'React, Node.js, TypeScript',
    required: false,
  })
  @IsOptional()
  @IsString()
  expertise?: string;

  @ApiProperty({
    description: 'GitHub username',
    example: 'janesmith',
    required: false,
  })
  @IsOptional()
  @IsString()
  githubHandle?: string;

  @ApiProperty({
    description: 'Motivation for becoming a mentor',
    example: 'I want to help new developers learn and grow in the open-source community.',
    required: false,
  })
  @IsOptional()
  @IsString()
  motivation?: string;
}
