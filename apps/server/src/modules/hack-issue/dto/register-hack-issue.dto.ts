import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterHackIssueDto {
  @ApiProperty({
    description: 'URL of a public GitHub issue',
    example: 'https://github.com/owner/repo/issues/42',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  url: string;
}
