import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from '../project/project.module';
import { UserModule } from '../user/user.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Community, CommunitySchema } from './schemas/community.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Community.name, schema: CommunitySchema }]),
    UserModule,
    ProjectModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [MongooseModule, CommunityService],
})
export class CommunityModule {}
