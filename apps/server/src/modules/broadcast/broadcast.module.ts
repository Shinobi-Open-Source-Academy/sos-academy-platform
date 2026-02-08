import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from '../community/schemas/community.schema';
import { EmailModule } from '../email/email.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { BroadcastController } from './broadcast.controller';
import { BroadcastService } from './broadcast.service';
import { Broadcast, BroadcastSchema } from './schemas/broadcast.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Community.name, schema: CommunitySchema },
      { name: Broadcast.name, schema: BroadcastSchema },
    ]),
    EmailModule,
  ],
  controllers: [BroadcastController],
  providers: [BroadcastService],
  exports: [BroadcastService],
})
export class BroadcastModule {}
