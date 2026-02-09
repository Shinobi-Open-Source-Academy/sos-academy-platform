import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RejectMentorDto {
  @ApiProperty({
    description: 'Reason for rejecting the mentor application (included in the rejection email)',
    example: 'We have decided to pursue other candidates at this time.',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({
    description:
      'Optional community ID to assign the user to as a member (hacker) after rejecting as mentor',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  communityId?: string;
}
