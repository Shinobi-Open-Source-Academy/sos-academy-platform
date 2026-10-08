import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminSessionGuard } from '../../common/guards/admin-session.guard';
import { GetHackIssuesQueryDto } from './dto/get-hack-issues.dto';
import { RegisterHackIssueDto } from './dto/register-hack-issue.dto';
import { HackIssueService } from './hack-issue.service';

@ApiTags('Hack Issues')
@Controller('hack-issues')
// TODO: open to senseis once a RolesGuard exists (#219)
@UseGuards(AdminSessionGuard)
export class HackIssueController {
  constructor(private readonly hackIssueService: HackIssueService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a GitHub issue from its URL — admin only' })
  @ApiBody({ type: RegisterHackIssueDto })
  @ApiResponse({ status: 201, description: 'Issue registered' })
  @ApiResponse({ status: 400, description: 'Invalid URL, pull request or closed issue' })
  @ApiResponse({ status: 404, description: "Issue doesn't exist or isn't public" })
  @ApiResponse({ status: 409, description: 'Issue already registered' })
  @ApiResponse({ status: 503, description: 'GitHub unavailable' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() dto: RegisterHackIssueDto, @Req() req: Request) {
    return this.hackIssueService.register(dto, req.session?.adminId);
  }

  @Get()
  @ApiOperation({ summary: 'List registered GitHub issues — admin only' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Query() query: GetHackIssuesQueryDto) {
    return this.hackIssueService.findAll(query);
  }
}
