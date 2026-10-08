import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@sos-academy/shared';
import { AdminOrRoles } from '../../common/decorators/admin-or-roles.decorator';
import { AddSquadMemberDto } from './dto/add-squad-member.dto';
import { CreateSquadDto } from './dto/create-squad.dto';
import { GetSquadsQueryDto } from './dto/get-squads.dto';
import { SquadIdParamDto, SquadMemberParamDto } from './dto/squad-params.dto';
import { SquadService } from './squad.service';

@ApiTags('Squads')
@Controller('squads')
@AdminOrRoles(UserRole.KAGE)
export class SquadController {
  constructor(private readonly squadService: SquadService) {}

  @Get()
  @ApiOperation({ summary: 'List squads — admin/kage only' })
  async findAll(@Query() query: GetSquadsQueryDto) {
    return this.squadService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a squad under a community — admin/kage only' })
  @ApiBody({ type: CreateSquadDto })
  @ApiResponse({ status: 201, description: 'Squad created' })
  @ApiResponse({ status: 400, description: 'Invalid mentor, member or capacity' })
  @ApiResponse({ status: 409, description: 'A member is already in another active squad' })
  async create(@Body() dto: CreateSquadDto) {
    return this.squadService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a squad with its members — admin/kage only' })
  async findOne(@Param() { id }: SquadIdParamDto) {
    return this.squadService.findById(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a mentee to a squad — admin/kage only' })
  @ApiBody({ type: AddSquadMemberDto })
  @ApiResponse({ status: 201, description: 'Mentee added' })
  @ApiResponse({ status: 400, description: 'Not an approved member, or inactive squad' })
  @ApiResponse({ status: 404, description: 'Squad or user not found' })
  @ApiResponse({ status: 409, description: 'Squad at capacity, or mentee already in a squad' })
  async addMember(@Param() { id }: SquadIdParamDto, @Body() { userId }: AddSquadMemberDto) {
    return this.squadService.addMember(id, userId);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a mentee from a squad — admin/kage only' })
  @ApiResponse({ status: 200, description: 'Mentee removed' })
  @ApiResponse({ status: 404, description: 'Squad not found, or user not in the squad' })
  async removeMember(@Param() { id, userId }: SquadMemberParamDto) {
    return this.squadService.removeMember(id, userId);
  }
}
