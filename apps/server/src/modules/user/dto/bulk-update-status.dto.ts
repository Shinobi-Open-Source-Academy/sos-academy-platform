import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsMongoId } from 'class-validator';
import { UserStatus } from '@sos-academy/shared';

export class BulkUpdateStatusDto {
  @ApiProperty({
    description: 'Array of user IDs to update',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f191e810c19729de860ea'],
  })
  @IsArray()
  @IsMongoId({ each: true })
  userIds: string[];

  @ApiProperty({
    description: 'New status to set for all selected users',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  status: UserStatus;
}
