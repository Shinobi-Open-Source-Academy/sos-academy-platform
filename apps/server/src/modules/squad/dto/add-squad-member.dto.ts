import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AddSquadMemberDto {
  @ApiProperty({ description: 'ID of the mentee to add' })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
