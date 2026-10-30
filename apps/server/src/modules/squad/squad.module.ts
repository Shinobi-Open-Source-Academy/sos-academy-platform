import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityModule } from '../community/community.module';
import { UserModule } from '../user/user.module';
import { MentorSquadController } from './mentor-squad.controller';
import { Squad, SquadSchema } from './schemas/squad.schema';
import { SquadController } from './squad.controller';
import { SquadService } from './squad.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Squad.name, schema: SquadSchema }]),
    UserModule,
    CommunityModule,
  ],
  // MentorSquadController first: `/squads/mine` must match before `/squads/:id`
  controllers: [MentorSquadController, SquadController],
  providers: [SquadService],
  exports: [MongooseModule, SquadService],
})
export class SquadModule {}
