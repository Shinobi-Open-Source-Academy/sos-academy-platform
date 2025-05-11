import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommunityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsMongoId()
  kage: string;

  @IsOptional()
  @IsMongoId({ each: true })
  mentors?: string[];

  @IsOptional()
  @IsMongoId({ each: true })
  members?: string[];

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
