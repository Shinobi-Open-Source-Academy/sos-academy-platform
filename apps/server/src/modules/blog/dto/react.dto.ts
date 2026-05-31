import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum ReactionType {
  HEART = 'heart',
  FIRE = 'fire',
  ROCKET = 'rocket',
  CLAP = 'clap',
  MIND_BLOWN = 'mind_blown',
}

export class ReactDto {
  @ApiProperty({ enum: ReactionType })
  @IsEnum(ReactionType)
  type: ReactionType;
}
