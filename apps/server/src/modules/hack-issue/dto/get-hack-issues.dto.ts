import { ApiPropertyOptional } from '@nestjs/swagger';
import { HackIssueStatus } from '@sos-academy/shared';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class GetHackIssuesQueryDto {
  @ApiPropertyOptional({ enum: HackIssueStatus })
  @IsOptional()
  @IsEnum(HackIssueStatus)
  status?: HackIssueStatus;

  @ApiPropertyOptional({ description: 'Search by title or repository' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(50)
  limit = 20;
}
