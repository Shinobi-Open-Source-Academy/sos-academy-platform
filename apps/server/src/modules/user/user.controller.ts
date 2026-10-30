import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ICurrentUser, UserRole, UserStatus } from '@sos-academy/shared';
import { Auth } from '../../common/decorators/auth.decorator';
import { AdminSessionGuard } from '../../common/guards/admin-session.guard';
import { SelfOrAdminGuard } from '../../common/guards/self-or-admin.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ApproveMentorDto } from './dto/approve-mentor.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { CommunityJoinDto } from './dto/community-join.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-user.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { MemberInvitationDto } from './dto/member-invitation.dto';
import { MentorApplicationDto } from './dto/mentor-application.dto';
import { RejectMentorDto } from './dto/reject-mentor.dto';
import { SubscribeUserDto } from './dto/subscribe-user.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MentorProfile, UserService } from './user.service';

/**
 * Fields users may change on their own record. Everything else (role, status, password,
 * membership level...) can only be changed by an admin.
 */
const SELF_EDITABLE_FIELDS = new Set<string>([
  'name',
  'bio',
  'profilePicture',
  'skills',
  'interests',
  'title',
  'description',
  'socialLinks',
]);

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Create a new user — admin only' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Get()
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Get all users — admin only' })
  @ApiResponse({ status: 200, description: 'List of all users', type: [UserResponseDto] })
  async findAll() {
    const users = await this.userService.findAll();
    return users.map((user) => new UserResponseDto(JSON.parse(JSON.stringify(user))));
  }

  @Get('me/mentor-profile')
  @Auth(UserRole.MENTOR, UserRole.KAGE)
  @ApiOperation({ summary: "Get the logged-in mentor's public profile fields" })
  async getMyMentorProfile(@CurrentUser() user: ICurrentUser): Promise<MentorProfile> {
    return this.userService.getMentorProfile(user._id);
  }

  @Patch('me/mentor-profile')
  @Auth(UserRole.MENTOR, UserRole.KAGE)
  @ApiOperation({
    summary: "Update the logged-in mentor's public profile (title, description, social links)",
  })
  @ApiBody({ type: UpdateMentorDto })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 403, description: 'Not an active mentor or kage' })
  async updateMyMentorProfile(
    @CurrentUser() user: ICurrentUser,
    @Body() dto: UpdateMentorDto
  ): Promise<MentorProfile> {
    return this.userService.updateMentorProfile(user._id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Put(':id')
  @UseGuards(OptionalJwtAuthGuard, SelfOrAdminGuard)
  @ApiOperation({
    summary: 'Update user by ID — admins, or users on their own non-privileged fields',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: "Another user's record, or a privileged field" })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: { isAdmin?: boolean }
  ) {
    if (!req.isAdmin) {
      const forbidden = Object.entries(updateUserDto)
        .filter(([field, value]) => value !== undefined && !SELF_EDITABLE_FIELDS.has(field))
        .map(([field]) => field);
      if (forbidden.length) {
        throw new ForbiddenException(`Only an admin can change: ${forbidden.join(', ')}`);
      }
    }

    const user = await this.userService.update(id, updateUserDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Delete(':id')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Delete user by ID — admin only' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    const user = await this.userService.remove(id);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Post('join/community')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Join community with email' })
  @ApiBody({ type: CommunityJoinDto })
  @ApiResponse({
    status: 201,
    description: 'User joined community successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async joinCommunity(@Body() communityJoinDto: CommunityJoinDto) {
    const user = await this.userService.joinCommunity(communityJoinDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to newsletter and join communities' })
  @ApiBody({ type: SubscribeUserDto })
  @ApiResponse({ status: 201, description: 'User subscribed successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async subscribe(@Body() subscribeUserDto: SubscribeUserDto) {
    const user = await this.userService.createOrUpdateFromSubscription(subscribeUserDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Post('mentor-application')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit mentor application' })
  @ApiBody({ type: MentorApplicationDto })
  @ApiResponse({
    status: 201,
    description: 'Mentor application submitted successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async mentorApplication(@Body() mentorApplicationDto: MentorApplicationDto) {
    const mentor = await this.userService.createMentorApplication(mentorApplicationDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(mentor)));
  }

  @Post('apply/mentor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply as mentor (alternative endpoint)' })
  @ApiBody({ type: MentorApplicationDto })
  @ApiResponse({
    status: 201,
    description: 'Mentor application submitted successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async applyAsMentor(@Body() mentorApplicationDto: MentorApplicationDto) {
    const mentor = await this.userService.applyAsMentor(mentorApplicationDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(mentor)));
  }

  @Post('invite/member')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite member to community' })
  @ApiBody({ type: MemberInvitationDto })
  @ApiResponse({ status: 201, description: 'Member invited successfully', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async inviteMember(@Body() memberInvitationDto: MemberInvitationDto) {
    const member = await this.userService.inviteMember(memberInvitationDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(member)));
  }

  @Put(':id/approve')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Approve mentor application' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: ApproveMentorDto, required: false })
  @ApiResponse({ status: 200, description: 'User approved successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async approveUser(@Param('id') id: string, @Body() body?: ApproveMentorDto) {
    const user = await this.userService.approveUser(id, body ?? {});
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Put(':id/reject')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Reject mentor application' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: RejectMentorDto })
  @ApiResponse({ status: 200, description: 'User rejected successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async rejectUser(@Param('id') id: string, @Body() body: RejectMentorDto) {
    const user = await this.userService.rejectUser(id, body);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  // ── Admin auth ──────────────────────────────────────────────────────────────

  @Post('admin/accept-invite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Accept admin invite — set password and activate account' })
  async acceptInvite(@Body() dto: AcceptInviteDto) {
    await this.userService.acceptInvite(dto);
  }

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login — sets session cookie' })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async adminLogin(@Body() adminLoginDto: AdminLoginDto, @Req() req: any) {
    return this.userService.adminLogin(adminLoginDto, req);
  }

  @Post('admin/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Admin logout — destroys session' })
  async adminLogout(@Req() req: any) {
    await this.userService.adminLogout(req);
  }

  @Get('admin/me')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Get current authenticated admin' })
  @ApiResponse({ status: 200, description: 'Current admin info' })
  async getAdminMe(@Req() req: any) {
    return this.userService.getAdminMe(req);
  }

  // ── Admin-protected data endpoints ──────────────────────────────────────────

  @Get('admin/stats')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getAdminStats() {
    return this.userService.getAdminStats();
  }

  @Get('admin/pending-mentors')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Get pending mentor applications' })
  @ApiResponse({ status: 200, description: 'Pending mentors retrieved successfully' })
  async getPendingMentors(): Promise<UserResponseDto[]> {
    const users = await this.userService.getPendingMentors();
    // biome-ignore lint/suspicious/noExplicitAny: mongoose document typing complexity
    return users.map((user: any) => new UserResponseDto(user));
  }

  @Get('admin/pending-members')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Get pending member registrations' })
  @ApiResponse({ status: 200, description: 'Pending members retrieved successfully' })
  async getPendingMembers(): Promise<UserResponseDto[]> {
    const users = await this.userService.getPendingMembers();
    // biome-ignore lint/suspicious/noExplicitAny: mongoose document typing complexity
    return users.map((user: any) => new UserResponseDto(user));
  }

  @Get('admin/users')
  @ApiOperation({ summary: 'Get users with pagination and filters' })
  @ApiOkResponse({ description: 'Users retrieved successfully', type: [UserResponseDto] })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getUsers(@Query() query: GetUsersQueryDto) {
    const { role, status, search, community, page, limit } = query;
    const result = await this.userService.getUsers({
      role: role as UserRole,
      status: status as UserStatus,
      search,
      community,
      page: page ?? 1,
      limit: limit ?? 20,
    });

    return {
      // biome-ignore lint/suspicious/noExplicitAny: user object from DB
      users: result.users.map((user: any) => new UserResponseDto(user)),
      pagination: result.pagination,
    };
  }

  // ── Super-admin only ─────────────────────────────────────────────────────────

  @Get('admin/admins')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'List all admin accounts — super admin only' })
  async listAdmins() {
    return this.userService.listAdmins();
  }

  @Post('admin/admins/invite')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Invite a new admin — super admin only' })
  @ApiBody({ type: InviteAdminDto })
  async inviteAdmin(@Body() dto: InviteAdminDto) {
    return this.userService.inviteAdmin(dto);
  }

  @Delete('admin/admins/:id')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke an admin account — super admin only' })
  @ApiParam({ name: 'id', description: 'Admin user ID' })
  async revokeAdmin(@Param('id') id: string, @Req() req: any) {
    await this.userService.revokeAdmin(id, req.session.adminId);
  }

  /**
   * Bulk update user status
   * @param dto - BulkUpdateStatusDto
   * @returns {Promise<{users: UserResponseDto[], pagination: PaginationResponseDto}>}
   */
  @Put('bulk/status')
  @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Bulk update user status' })
  @ApiBody({ type: BulkUpdateStatusDto })
  @ApiOkResponse({ description: 'Users updated successfully' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkUpdateStatus(@Body() dto: BulkUpdateStatusDto) {
    return this.userService.bulkUpdateStatus(dto.userIds, dto.status);
  }
}
