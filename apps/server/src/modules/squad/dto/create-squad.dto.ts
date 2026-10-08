import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateSquadDto {
  @ApiProperty({ description: 'ID of an approved mentor (or kage)' })
  @IsNotEmpty()
  @IsMongoId()
  mentor: string;

  @ApiProperty({ description: 'Community ID' })
  @IsNotEmpty()
  @IsMongoId()
  community: string;

  @ApiPropertyOptional({ type: [String], description: 'IDs of approved members' })
  @IsOptional()
  @IsMongoId({ each: true })
  members?: string[];

  @ApiPropertyOptional({ default: 5, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
