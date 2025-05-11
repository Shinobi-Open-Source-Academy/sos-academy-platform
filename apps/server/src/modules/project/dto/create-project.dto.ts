import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectRank } from '@sos-academy/shared';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(ProjectRank)
  rank: ProjectRank;

  @IsNotEmpty()
  @IsMongoId()
  owner: string;

  @IsNotEmpty()
  @IsMongoId()
  community: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsUrl()
  githubRepo?: string;

  @IsOptional()
  @IsString({ each: true })
  technologies?: string[];

  @IsOptional()
  @IsString()
  thumbnail?: string;
}
