import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityModule } from '../community/community.module';
import { UserModule } from '../user/user.module';
import { Squad, SquadSchema } from './schemas/squad.schema';
import { SquadService } from './squad.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Squad.name, schema: SquadSchema }]),
    UserModule,
    CommunityModule,
  ],
  providers: [SquadService],
  exports: [MongooseModule, SquadService],
})
export class SquadModule {}
