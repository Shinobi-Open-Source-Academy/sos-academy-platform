import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole, UserStatus } from '@sos-academy/shared';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { Model, Schema } from 'mongoose';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MemberInvitationDto } from './dto/member-invitation.dto';
import { MentorApplicationDto } from './dto/mentor-application.dto';
import { SubscribeUserDto } from './dto/subscribe-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

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
    let hashedPassword: string;
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
  async applyAsMentor(mentorApplicationDto: MentorApplicationDto): Promise<User> {
    const { email, name, expertise, githubHandle, motivation } = mentorApplicationDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create mentor application
    const newMentor = new this.userModel({
      email,
      name,
      expertise,
      motivation,
      role: UserRole.MENTOR,
      status: UserStatus.APPLIED_MENTOR,
      source: 'mentor-application',
    });

    // Enrich with GitHub profile if handle provided
    if (githubHandle) {
      try {
        const githubProfile = await this.fetchGitHubProfile(githubHandle);
        if (githubProfile) {
          newMentor.githubProfile = githubProfile;
        }
      } catch (error) {
        console.error('Failed to fetch GitHub profile:', error);
      }
    }

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

  /**
   * Create or update user from subscription
   * @param subscribeUserDto Subscription data
   */
  async createOrUpdateFromSubscription(subscribeUserDto: SubscribeUserDto): Promise<User> {
    const { email, name, communities, githubHandle } = subscribeUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      // Update existing user
      existingUser.name = name || existingUser.name;
      existingUser.communities = communities.map((id) => new Schema.Types.ObjectId(id));
      existingUser.source = 'subscription';
      existingUser.status = UserStatus.PENDING;

      // Enrich with GitHub profile if handle provided
      if (githubHandle) {
        try {
          const githubProfile = await this.fetchGitHubProfile(githubHandle);
          if (githubProfile) {
            existingUser.githubProfile = githubProfile;
          }
        } catch (error) {
          console.error('Failed to fetch GitHub profile:', error);
        }
      }

      const savedUser = await existingUser.save();

      // Send confirmation email
      try {
        await this.emailService.sendCommunityJoinConfirmation(email, name, communities);
      } catch (error) {
        console.error('Failed to send subscription confirmation email:', error);
      }

      return savedUser;
    }
    // Create new user
    const newUser = new this.userModel({
      email,
      name: name || '',
      communities: communities.map((id) => new Schema.Types.ObjectId(id)),
      role: UserRole.MEMBER,
      status: UserStatus.PENDING,
      source: 'subscription',
    });

    // Enrich with GitHub profile if handle provided
    if (githubHandle) {
      try {
        const githubProfile = await this.fetchGitHubProfile(githubHandle);
        if (githubProfile) {
          newUser.githubProfile = githubProfile;
        }
      } catch (error) {
        console.error('Failed to fetch GitHub profile:', error);
      }
    }

    const savedUser = await newUser.save();

    // Send confirmation email
    try {
      await this.emailService.sendCommunityJoinConfirmation(email, name, communities);
    } catch (error) {
      console.error('Failed to send subscription confirmation email:', error);
    }

    return savedUser;
  }

  /**
   * Create mentor application
   * @param mentorApplicationDto Mentor application data
   */
  async createMentorApplication(mentorApplicationDto: MentorApplicationDto): Promise<User> {
    const { email, name, expertise, githubHandle, motivation } = mentorApplicationDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create mentor application
    const newMentor = new this.userModel({
      email,
      name,
      expertise,
      motivation,
      role: UserRole.MENTOR,
      status: UserStatus.PENDING,
      source: 'mentor-application',
    });

    // Enrich with GitHub profile if handle provided
    if (githubHandle) {
      try {
        const githubProfile = await this.fetchGitHubProfile(githubHandle);
        if (githubProfile) {
          newMentor.githubProfile = githubProfile;
        }
      } catch (error) {
        console.error('Failed to fetch GitHub profile:', error);
      }
    }

    const savedMentor = await newMentor.save();

    // Send confirmation email
    try {
      await this.emailService.sendMentorApplicationConfirmation(email, name);
    } catch (error) {
      console.error('Failed to send mentor application email:', error);
    }

    return savedMentor;
  }

  /**
   * Fetch GitHub profile by handle
   * @param handle GitHub username
   */
  private async fetchGitHubProfile(handle: string): Promise<{
    login: string;
    avatarUrl?: string;
    htmlUrl?: string;
    publicRepos?: number;
    followers?: number;
    following?: number;
    createdAt?: Date;
    lastUpdated: Date;
    email?: string;
    bio?: string;
    location?: string;
    company?: string;
    blog?: string;
    twitterUsername?: string;
    githubId?: number;
  } | null> {
    try {
      const token = process.env.GITHUB_TOKEN;
      const headers = token ? { Authorization: `token ${token}` } : {};

      const response = await axios.get(`https://api.github.com/users/${handle}`, {
        headers,
        timeout: 5000,
      });

      return {
        login: response.data.login,
        avatarUrl: response.data.avatar_url,
        htmlUrl: response.data.html_url,
        publicRepos: response.data.public_repos,
        followers: response.data.followers,
        following: response.data.following,
        createdAt: response.data.created_at ? new Date(response.data.created_at) : undefined,
        lastUpdated: new Date(),
        email: response.data.email,
        bio: response.data.bio,
        location: response.data.location,
        company: response.data.company,
        blog: response.data.blog,
        twitterUsername: response.data.twitter_username,
        githubId: response.data.id,
      };
    } catch (error) {
      console.error(`Failed to fetch GitHub profile for ${handle}:`, error.message);
      return null;
    }
  }
}
