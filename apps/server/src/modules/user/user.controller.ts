import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MentorApplicationDto } from './dto/mentor-application.dto';
import { MemberInvitationDto } from './dto/member-invitation.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CommunityJoinDto } from './dto/community-join.dto';
import { SubscribeUserDto } from './dto/subscribe-user.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return users.map(
      (user) => new UserResponseDto(JSON.parse(JSON.stringify(user)))
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.userService.remove(id);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Post('join/community')
  @HttpCode(HttpStatus.CREATED)
  async joinCommunity(@Body() communityJoinDto: CommunityJoinDto) {
    const user = await this.userService.joinCommunity(
      communityJoinDto.email,
      communityJoinDto.name,
    );
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribe(@Body() subscribeUserDto: SubscribeUserDto) {
    const user = await this.userService.createOrUpdateFromSubscription(subscribeUserDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Post('mentor-application')
  @HttpCode(HttpStatus.CREATED)
  async mentorApplication(@Body() mentorApplicationDto: MentorApplicationDto) {
    const mentor = await this.userService.createMentorApplication(mentorApplicationDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(mentor)));
  }

  @Post('apply/mentor')
  @HttpCode(HttpStatus.CREATED)
  async applyAsMentor(@Body() mentorApplicationDto: MentorApplicationDto) {
    const mentor = await this.userService.applyAsMentor(mentorApplicationDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(mentor)));
  }

  @Post('invite/member')
  @HttpCode(HttpStatus.CREATED)
  async inviteMember(@Body() memberInvitationDto: MemberInvitationDto) {
    const member = await this.userService.inviteMember(memberInvitationDto);
    return new UserResponseDto(JSON.parse(JSON.stringify(member)));
  }

  @Put(':id/approve')
  async approveUser(@Param('id') id: string) {
    const user = await this.userService.approveUser(id);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }

  @Put(':id/reject')
  async rejectUser(@Param('id') id: string) {
    const user = await this.userService.rejectUser(id);
    return new UserResponseDto(JSON.parse(JSON.stringify(user)));
  }
}
