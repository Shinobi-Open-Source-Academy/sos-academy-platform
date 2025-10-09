import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole, UserStatus } from '@sos-academy/shared';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import mongoose, { Model, Schema } from 'mongoose';
import { envConfig } from '../../common/config/env.config';
import { Community, CommunityDocument } from '../community/schemas/community.schema';
import { EmailService } from '../email/email.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CommunityJoinDto } from './dto/community-join.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-user.dto';
import { MemberInvitationDto } from './dto/member-invitation.dto';
import { MentorApplicationDto } from './dto/mentor-application.dto';
import { SubscribeUserDto } from './dto/subscribe-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
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
   * @param communityJoinDto Community join data
   */
  async joinCommunity(communityJoinDto: CommunityJoinDto): Promise<User> {
    const { email, name, communities, githubHandle } = communityJoinDto;
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Look up community ObjectIds by slug or name with SIMPLE case-insensitive matching
    let communityObjectIds: mongoose.Types.ObjectId[] = [];
    if (communities && communities.length > 0) {
      // Get all communities first
      const allCommunities = await this.communityModel.find({}).select('_id name slug').exec();

      // Simple case-insensitive matching
      const foundCommunities = allCommunities.filter((community) => {
        return communities.some((inputCommunity) => {
          const inputLower = inputCommunity.toLowerCase();
          const nameLower = community.name.toLowerCase();
          const slugLower = community.slug.toLowerCase();
          return nameLower === inputLower || slugLower === inputLower;
        });
      });

      communityObjectIds = foundCommunities.map(
        (community) => community._id as mongoose.Types.ObjectId
      );

      // Log any communities that weren't found
      const foundNames = foundCommunities.map((c) => c.name.toLowerCase());
      const notFound = communities.filter(
        (identifier) => !foundNames.includes(identifier.toLowerCase())
      );
      if (notFound.length > 0) {
        console.warn(`Communities not found: ${notFound.join(', ')}`);
      }
    }

    // Create user entry
    const newUser = new this.userModel({
      email,
      name: name || '',
      role: UserRole.MEMBER,
      status: UserStatus.INACTIVE,
      communities: communityObjectIds,
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

  /**
   * Admin login - verify against database user with hashed password
   */
  async adminLogin(adminLoginDto: AdminLoginDto): Promise<{ success: boolean; message: string }> {
    const { email, password } = adminLoginDto;

    // Find admin user in database
    const adminUser = await this.userModel
      .findOne({
        email: email,
        role: UserRole.KAGE,
        status: UserStatus.ACTIVE,
      })
      .select('+password')
      .exec();

    if (!adminUser) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Verify password against hashed password
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return {
      success: true,
      message: 'Login successful',
    };
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats() {
    const [totalUsers, pendingMentors, pendingMembers, activeUsers, totalCommunities] =
      await Promise.all([
        this.userModel.countDocuments().exec(),
        this.userModel
          .countDocuments({
            $or: [
              { status: UserStatus.APPLIED_MENTOR },
              { status: UserStatus.PENDING, source: 'mentor-application' },
            ],
          })
          .exec(),
        this.userModel
          .countDocuments({
            status: { $in: [UserStatus.PENDING, UserStatus.INACTIVE] },
            source: { $ne: 'mentor-application' },
          })
          .exec(),
        this.userModel.countDocuments({ status: UserStatus.ACTIVE }).exec(),
        this.communityModel.countDocuments().exec(),
      ]);

    return {
      totalUsers,
      pendingMentors,
      pendingMembers,
      activeUsers,
      totalCommunities,
    };
  }

  /**
   * Get pending mentor applications
   */
  async getPendingMentors() {
    return this.userModel
      .find({
        $or: [
          { status: UserStatus.APPLIED_MENTOR },
          { status: UserStatus.PENDING, source: 'mentor-application' },
        ],
      })
      .populate('communities', 'name slug')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get pending member registrations
   */
  async getPendingMembers() {
    return this.userModel
      .find({
        status: { $in: [UserStatus.PENDING, UserStatus.INACTIVE] },
        source: { $ne: 'mentor-application' },
      })
      .populate('communities', 'name slug')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get users with pagination and filters
   */
  async getUsers(query: GetUsersQueryDto) {
    const { role, status, search, community } = query;

    // Cap limit and normalize page
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
    const page = Math.max(query.page ?? 1, 1);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (role) {
      filter.role = role;
    }
    if (status) {
      filter.status = status;
    }

    if (search) {
      const safe = this.escapeRegex(search);
      const regex = new RegExp(safe, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { 'githubProfile.login': regex }];
    }

    // Optional community slug filter
    if (community) {
      const communityDoc = await this.communityModel
        .findOne({ slug: community })
        .select('_id')
        .lean()
        .exec();
      if (!communityDoc) {
        // Early return when community slug not found
        return {
          users: [],
          pagination: { total: 0, page, limit, pages: 0 },
        };
      }
      filter.communities = communityDoc._id;
    }

    // Projection to reduce payload; adjust fields to your schema
    const projection = {
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      status: 1,
      githubProfile: 1,
      communities: 1,
      createdAt: 1,
    };

    // Query with lean to avoid class-transformer recursion
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter, projection)
        .populate({ path: 'communities', select: 'name slug', options: { lean: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      users, // plain objects (safe to transform)
      pagination: {
        total,
        page,
        limit,
        pages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  private escapeRegex(input: string): string {
    // Prevent ReDoS / special char issues in regex
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
