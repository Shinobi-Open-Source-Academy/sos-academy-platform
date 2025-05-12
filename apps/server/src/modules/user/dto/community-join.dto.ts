import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommunityJoinDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
} 