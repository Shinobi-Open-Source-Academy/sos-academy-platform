import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GitHubModule } from '../github/github.module';
import { HackIssueController } from './hack-issue.controller';
import { HackIssueService } from './hack-issue.service';
import { HackIssue, HackIssueSchema } from './schemas/hack-issue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HackIssue.name, schema: HackIssueSchema }]),
    GitHubModule,
  ],
  controllers: [HackIssueController],
  providers: [HackIssueService],
  exports: [MongooseModule, HackIssueService],
})
export class HackIssueModule {}
