import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class InviteAdminDto {
  @ApiPropertyOptional({
    example: 'Jane Smith',
    description: 'Required for new users; ignored when promoting an existing user.',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;
}
