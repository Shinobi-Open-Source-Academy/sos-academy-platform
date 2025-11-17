import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribeUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'Joseph Mukuna',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Array of community IDs to join',
    example: ['react-community', 'nodejs-community'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  communities: string[];

  @ApiProperty({
    description: 'GitHub username (optional)',
    example: 'josephmukuna',
    required: false,
  })
  @IsOptional()
  @IsString()
  githubHandle?: string;
}
