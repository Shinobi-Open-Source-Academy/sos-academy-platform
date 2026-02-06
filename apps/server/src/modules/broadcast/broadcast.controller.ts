import { Body, Controller, Get, Param, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';

@ApiTags('Broadcast')
@Controller('broadcast')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post()
  @ApiOperation({ summary: 'Create and send a broadcast message' })
  @ApiResponse({ status: 201, description: 'Broadcast sent successfully' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createBroadcast(@Body() dto: CreateBroadcastDto) {
    return this.broadcastService.createBroadcast(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of recent broadcasts' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of broadcasts to return' })
  @ApiResponse({ status: 200, description: 'Broadcasts retrieved successfully' })
  async getBroadcasts(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.broadcastService.getBroadcasts(limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific broadcast by ID' })
  @ApiParam({ name: 'id', description: 'Broadcast ID' })
  @ApiResponse({ status: 200, description: 'Broadcast retrieved successfully' })
  async getBroadcast(@Param('id') id: string) {
    return this.broadcastService.getBroadcastById(id);
  }

  @Post(':id/retrigger')
  @ApiOperation({ summary: 'Retrigger/resend a previous broadcast' })
  @ApiParam({ name: 'id', description: 'Broadcast ID to retrigger' })
  @ApiResponse({ status: 200, description: 'Broadcast retriggered successfully' })
  async retriggerBroadcast(@Param('id') id: string) {
    return this.broadcastService.retriggerBroadcast(id);
  }
}
