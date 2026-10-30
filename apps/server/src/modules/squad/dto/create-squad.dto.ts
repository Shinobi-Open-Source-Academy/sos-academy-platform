import { IsInt, IsMongoId, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateSquadDto {
  @IsNotEmpty()
  @IsMongoId()
  mentor: string;

  @IsNotEmpty()
  @IsMongoId()
  community: string;

  @IsOptional()
  @IsMongoId({ each: true })
  members?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
