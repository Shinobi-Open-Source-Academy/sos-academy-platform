import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectService } from './project.service';
import { Project, ProjectDocument } from './schemas/project.schema';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>
  ) {}

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get fresh GitHub stats for a project' })
  async getProjectStats(@Param('id') id: string) {
    const project = await this.projectModel.findById(id).lean().exec();
    if (!project) {
      return { error: 'Project not found' };
    }

    const stats = await this.projectService.fetchProjectStats(project);
    if (!stats) {
      // Return DB stats if fetch failed
      return {
        stars: project.stars || 0,
        contributors: project.contributors || 0,
        lastUpdated: project.lastUpdated || new Date(),
        website: project.website || project.url || null,
      };
    }

    return stats;
  }

  @Post(':id/refresh-stats')
  @ApiOperation({ summary: 'Refresh GitHub stats for a project' })
  async refreshProjectStats(@Param('id') id: string) {
    const project = await this.projectModel.findById(id).lean().exec();
    if (!project) {
      return { error: 'Project not found' };
    }

    const stats = await this.projectService.fetchProjectStats(project);
    return stats || { message: 'Failed to fetch stats' };
  }
}
