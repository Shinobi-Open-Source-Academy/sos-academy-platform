import { IsMongoId } from 'class-validator';

export class SquadIdParamDto {
  @IsMongoId()
  id: string;
}

export class SquadMemberParamDto extends SquadIdParamDto {
  @IsMongoId()
  userId: string;
}
