import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCommunityDto } from './create-community.dto';

export class UpdateCommunityDto extends PartialType(
  OmitType(CreateCommunityDto, ['kage'] as const)
) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
