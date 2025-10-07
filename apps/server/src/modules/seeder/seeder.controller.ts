import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseStatus, SeederService, SeedingResult } from './seeder.service';

@ApiTags('seeder')
@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post('seed')
  @ApiOperation({ summary: 'Seed communities into the database' })
  @ApiResponse({
    status: 201,
    description: 'Communities seeded successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        count: { type: 'number', example: 6 },
        message: { type: 'string', example: 'Communities seeded successfully' },
      },
    },
  })
  async seedCommunities(): Promise<SeedingResult> {
    return await this.seederService.seedCommunities();
  }

  @Post('clear')
  @ApiOperation({ summary: 'Clear all communities from the database' })
  @ApiResponse({
    status: 200,
    description: 'Communities cleared successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        count: { type: 'number', example: 6 },
        message: { type: 'string', example: 'Communities cleared successfully' },
      },
    },
  })
  async clearCommunities(): Promise<SeedingResult> {
    return await this.seederService.clearCommunities();
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset communities (clear + seed)' })
  @ApiResponse({
    status: 201,
    description: 'Communities reset successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        count: { type: 'number', example: 6 },
        message: { type: 'string', example: 'Communities seeded successfully' },
      },
    },
  })
  async resetCommunities(): Promise<SeedingResult> {
    return await this.seederService.resetCommunities();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get database seeding status' })
  @ApiResponse({
    status: 200,
    description: 'Database status retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        totalCommunities: { type: 'number', example: 6 },
        activeCommunities: { type: 'number', example: 6 },
        inactiveCommunities: { type: 'number', example: 0 },
        communities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'JavaScript' },
              isActive: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
  })
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    return await this.seederService.getDatabaseStatus();
  }
}
