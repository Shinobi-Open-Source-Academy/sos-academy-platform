import { Type } from 'class-transformer';
import { IsDate, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateAvailabilitySlotDto {
  @IsNotEmpty()
  @IsMongoId()
  mentorId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endTime: Date;
}
