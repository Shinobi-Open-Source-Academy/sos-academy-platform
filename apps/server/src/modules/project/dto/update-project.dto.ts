import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ProjectStatus } from '@sos-academy/shared';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(
  OmitType(CreateProjectDto, ['owner', 'community'] as const)
) {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsMongoId({ each: true })
  members?: string[];
}
