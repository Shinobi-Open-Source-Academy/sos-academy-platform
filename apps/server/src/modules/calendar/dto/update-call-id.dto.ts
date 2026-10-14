import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCallIdDto {
  @ApiProperty({
    description: 'The NotesBot call ID to link with this event',
    example: 'call_abc123xyz',
  })
  @IsNotEmpty()
  @IsString()
  callId: string;
}
