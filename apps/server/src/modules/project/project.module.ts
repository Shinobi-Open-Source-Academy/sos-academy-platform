import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { Project, ProjectSchema } from './schemas/project.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]), UserModule],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class ProjectModule {}
