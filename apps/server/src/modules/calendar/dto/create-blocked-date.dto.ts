import { Type } from 'class-transformer';
import { IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlockedDateDto {
  @IsNotEmpty()
  @IsMongoId()
  mentorId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsString()
  reason?: string;
}
