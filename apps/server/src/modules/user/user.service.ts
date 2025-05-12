import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MentorApplicationDto } from './dto/mentor-application.dto';
import { MemberInvitationDto } from './dto/member-invitation.dto';
import { UserRole, UserStatus } from '@sos-academy/shared';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await this.hashPassword(password);
    }

    // Create user
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await createdUser.save();

    // Send welcome email
    try {
      await this.emailService.sendCommunityJoinConfirmation(email, name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return deletedUser;
  }

  /**
   * Join community with just an email address
   * @param email User's email address
   * @param name Optional user's name
   */
  async joinCommunity(email: string, name?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create minimal user entry
    const newUser = new this.userModel({
      email,
      name: name || '',
      role: UserRole.MEMBER,
      status: UserStatus.INACTIVE,
    });

    const savedUser = await newUser.save();

    // Send confirmation email
    try {
      await this.emailService.sendCommunityJoinConfirmation(email, name);
    } catch (error) {
      console.error('Failed to send community join email:', error);
    }

    return savedUser;
  }

  /**
   * Apply as a mentor with full application
   * @param mentorApplicationDto Mentor application data
   */
  async applyAsMentor(
    mentorApplicationDto: MentorApplicationDto
  ): Promise<User> {
    const { email, password, name } = mentorApplicationDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create mentor application
    const newMentor = new this.userModel({
      ...mentorApplicationDto,
      password: hashedPassword,
      role: UserRole.MENTOR,
      status: UserStatus.APPLIED_MENTOR,
    });

    const savedMentor = await newMentor.save();

    // Send confirmation email
    try {
      await this.emailService.sendMentorApplicationConfirmation(email, name);
    } catch (error) {
      console.error('Failed to send mentor application email:', error);
    }

    return savedMentor;
  }

  async inviteMember(memberInvitationDto: MemberInvitationDto): Promise<User> {
    const { email, password } = memberInvitationDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create member invitation
    const newMember = new this.userModel({
      ...memberInvitationDto,
      password: hashedPassword,
      role: UserRole.MEMBER,
      status: UserStatus.INVITED,
    });

    return newMember.save();
  }

  async approveUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.status = UserStatus.ACTIVE;
    user.isActive = true;

    return user.save();
  }

  async rejectUser(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.status = UserStatus.REJECTED;

    return user.save();
  }
}
