import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ICurrentUser, UserRole } from '@sos-academy/shared';
import { Auth } from '../../common/decorators/auth.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetAvailableHackIssuesQueryDto } from './dto/get-available-hack-issues.dto';
import { AssignHackIssueDto, HackIssueIdParamDto } from './dto/hack-issue-params.dto';
import { HackIssueClaimService } from './hack-issue-claim.service';

/**
 * The hacker side of the hack platform: browse open issues, claim and release them.
 * Any active account can claim; assigning to someone else is for mentors and kages.
 */
@ApiTags('Hack Issues')
@ApiBearerAuth()
@Controller('hack-issues')
@Auth(UserRole.MEMBER, UserRole.MENTOR, UserRole.KAGE)
export class HackIssueClaimController {
  constructor(private readonly claimService: HackIssueClaimService) {}

  @Get('available')
  @ApiOperation({ summary: 'Open issues that can be claimed' })
  async findAvailable(@Query() query: GetAvailableHackIssuesQueryDto) {
    return this.claimService.findAvailable(query);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Issues the logged-in hacker is working on, and their claim limit' })
  async findMine(@CurrentUser() user: ICurrentUser) {
    return this.claimService.findMine(user._id);
  }

  @Post(':id/claim')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim an open issue' })
  @ApiResponse({ status: 200, description: 'Issue assigned to the logged-in hacker' })
  @ApiResponse({ status: 409, description: 'Already assigned, or claim limit reached' })
  async claim(@Param() { id }: HackIssueIdParamDto, @CurrentUser() user: ICurrentUser) {
    return this.claimService.claim(id, user);
  }

  @Post(':id/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Give a claimed issue back to the pool' })
  @ApiResponse({ status: 200, description: 'Issue is OPEN again' })
  @ApiResponse({ status: 403, description: 'Not the assignee' })
  async release(@Param() { id }: HackIssueIdParamDto, @CurrentUser() user: ICurrentUser) {
    return this.claimService.release(id, user);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  // Replaces the controller's roles for this route (the guards are already applied)
  @Roles(UserRole.MENTOR, UserRole.KAGE)
  @ApiOperation({ summary: 'Assign an issue to a mentee — mentors (own squad) and kages' })
  @ApiBody({ type: AssignHackIssueDto })
  @ApiResponse({ status: 403, description: 'The user is not in your squad' })
  @ApiResponse({ status: 409, description: 'Already assigned, or the mentee is at the limit' })
  async assign(
    @Param() { id }: HackIssueIdParamDto,
    @Body() { userId }: AssignHackIssueDto,
    @CurrentUser() user: ICurrentUser
  ) {
    return this.claimService.assignTo(id, userId, user);
  }
}
