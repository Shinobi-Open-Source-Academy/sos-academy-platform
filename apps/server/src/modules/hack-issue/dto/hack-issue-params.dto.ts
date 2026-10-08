import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class HackIssueIdParamDto {
  @IsMongoId()
  id: string;
}

export class AssignHackIssueDto {
  @ApiProperty({ description: 'ID of the mentee to assign the issue to' })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}
