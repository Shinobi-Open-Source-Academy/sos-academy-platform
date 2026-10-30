import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class GetSquadsQueryDto {
  @ApiPropertyOptional({ description: 'Community ID' })
  @IsOptional()
  @IsMongoId()
  community?: string;

  @ApiPropertyOptional({ description: 'Only active (true) or inactive (false) squads' })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  isActive?: boolean;
}
