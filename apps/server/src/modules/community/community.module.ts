import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectModule } from '../project/project.module';
import { UserModule } from '../user/user.module';
import { Community, CommunitySchema } from './schemas/community.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Community.name, schema: CommunitySchema }]),
    UserModule,
    ProjectModule,
  ],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class CommunityModule {}
