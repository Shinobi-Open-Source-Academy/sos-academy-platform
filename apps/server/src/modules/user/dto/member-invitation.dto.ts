import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class MemberInvitationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @IsNotEmpty()
  @IsString({ each: true })
  interests: string[];

  @IsOptional()
  @IsUrl()
  githubProfile?: string;

  @IsOptional()
  @IsString()
  motivation?: string;
}
