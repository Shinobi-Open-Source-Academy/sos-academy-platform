import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSessionGuard } from '../../common/guards/admin-session.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { Community, CommunitySchema } from '../community/schemas/community.schema';
import { EmailModule } from '../email/email.module';
import { GitHubModule } from '../github/github.module';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Community.name, schema: CommunitySchema },
    ]),
    EmailModule,
    GitHubModule,
  ],
  controllers: [UserController],
  providers: [UserService, AdminSessionGuard, SuperAdminGuard],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
