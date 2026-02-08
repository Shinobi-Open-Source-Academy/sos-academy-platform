import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GitHubModule } from '../github/github.module';
import { UserModule } from '../user/user.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project, ProjectSchema } from './schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    UserModule,
    GitHubModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [MongooseModule, ProjectService],
})
export class ProjectModule {}
