import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommunityJoinDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User full name (optional)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Array of community IDs to join',
    example: ['react-community', 'nodejs-community'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  communities?: string[];

  @ApiProperty({
    description: 'GitHub username (optional)',
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString()
  githubHandle?: string;
}
