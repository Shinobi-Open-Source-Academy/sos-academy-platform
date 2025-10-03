import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommunityJoinDto } from './dto/community-join.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { MemberInvitationDto } from './dto/member-invitation.dto';
import { MentorApplicationDto } from './dto/mentor-application.dto';
import { SubscribeUserDto } from './dto/subscribe-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users', type: [UserResponseDto] })
  async findAll() {
    const users = await this.userService.findAll();
    return users.map((user) => new UserResponseDto(JSON.parse(JSON.stringify(user))));
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
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
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
    const user = await this.userService.joinCommunity(
      communityJoinDto.email,
      communityJoinDto.name
    );
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
  @ApiOperation({ summary: 'Approve user application' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User approved successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async approveUser(@Param('id') id: string) {
    const user = await this.userService.approveUser(id);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject user application' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User rejected successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async rejectUser(@Param('id') id: string) {
    const user = await this.userService.rejectUser(id);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }
}
