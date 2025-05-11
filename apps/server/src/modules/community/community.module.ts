import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Community, CommunitySchema } from './schemas/community.schema';
import { UserModule } from '../user/user.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Community.name, schema: CommunitySchema },
    ]),
    UserModule,
    ProjectModule,
  ],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class CommunityModule {}
