import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GitHubModule } from '../github/github.module';
import { SquadModule } from '../squad/squad.module';
import { UserModule } from '../user/user.module';
import { HackIssueController } from './hack-issue.controller';
import { HackIssueService } from './hack-issue.service';
import { HackIssueClaimController } from './hack-issue-claim.controller';
import { HackIssueClaimService } from './hack-issue-claim.service';
import { HackIssue, HackIssueSchema } from './schemas/hack-issue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HackIssue.name, schema: HackIssueSchema }]),
    GitHubModule,
    SquadModule,
    UserModule,
  ],
  controllers: [HackIssueController, HackIssueClaimController],
  providers: [HackIssueService, HackIssueClaimService],
  exports: [MongooseModule, HackIssueService, HackIssueClaimService],
})
export class HackIssueModule {}
