import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';
import { ProjectStatus } from '@sos-academy/shared';

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
