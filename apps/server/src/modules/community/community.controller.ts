import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { Community } from './schemas/community.schema';

@ApiTags('communities')
@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active communities' })
  @ApiResponse({
    status: 200,
    description: 'List of all active communities',
    type: [Community],
  })
  async findAll(): Promise<Community[]> {
    return this.communityService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get community  statistics' })
  @ApiResponse({
    status: 200,
    description: 'Community statistics including total counts',
    schema: {
      type: 'object',
      properties: {
        totalCommunities: { type: 'number' },
        totalMembers: { type: 'number' },
        totalMentors: { type: 'number' },
        totalProjects: { type: 'number' },
      },
    },
  })
  async getStats(): Promise<{
    totalCommunities: number;
    totalMembers: number;
    totalMentors: number;
    totalProjects: number;
  }> {
    return this.communityService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get community by ID' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiResponse({
    status: 200,
    description: 'Community details',
    type: Community,
  })
  @ApiResponse({
    status: 404,
    description: 'Community not found',
  })
  async findById(@Param('id') id: string): Promise<Community | null> {
    return this.communityService.findById(id);
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get community by name' })
  @ApiParam({ name: 'name', description: 'Community name' })
  @ApiResponse({
    status: 200,
    description: 'Community details',
    type: Community,
  })
  @ApiResponse({
    status: 404,
    description: 'Community not found',
  })
  async findByName(@Param('name') name: string): Promise<Community | null> {
    return this.communityService.findByName(name);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get community by slug' })
  @ApiParam({ name: 'slug', description: 'Community slug' })
  @ApiResponse({
    status: 200,
    description: 'Community details',
    type: Community,
  })
  @ApiResponse({
    status: 404,
    description: 'Community not found',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Community | null> {
    return this.communityService.findBySlug(slug);
  }
}
