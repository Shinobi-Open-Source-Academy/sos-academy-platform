import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole, UserStatus } from '@sos-academy/shared';
import * as bcrypt from 'bcryptjs';
import mongoose, { Model, Schema } from 'mongoose';
import { Community, CommunityDocument } from '../community/schemas/community.schema';
import { EmailService } from '../email/email.service';
import { GitHubService } from '../github/github.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ApproveMentorDto } from './dto/approve-mentor.dto';
import { CommunityJoinDto } from './dto/community-join.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersQueryDto } from './dto/get-user.dto';
import { MemberInvitationDto } from './dto/member-invitation.dto';
import { MentorApplicationDto } from './dto/mentor-application.dto';
import { RejectMentorDto } from './dto/reject-mentor.dto';
import { SubscribeUserDto } from './dto/subscribe-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    private readonly emailService: EmailService,
    private readonly githubService: GitHubService
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

    const savedUser = await newUser.save();

    // Fetch GitHub profile + send org invitation asynchronously (non-blocking)
    if (githubHandle) {
      this.enrichUserWithGitHub(savedUser._id.toString(), githubHandle, email);
    }

    // Send confirmation email (non-blocking)
    this.emailService.sendCommunityJoinConfirmation(email, name, communities).catch((error) => {
      console.error('Failed to send community join email:', error);
    });

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

    const savedMentor = await newMentor.save();

    // Fetch GitHub profile + send org invitation asynchronously (non-blocking)
    if (githubHandle) {
      this.enrichUserWithGitHub(savedMentor._id.toString(), githubHandle, email);
    }

    // Send confirmation email (non-blocking)
    this.emailService.sendMentorApplicationConfirmation(email, name).catch((error) => {
      console.error('Failed to send mentor application email:', error);
    });

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

  async approveUser(id: string, dto: ApproveMentorDto = {}): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { customMessage, communityIds = [] } = dto;
    const communityObjectIds =
      communityIds.length > 0
        ? communityIds
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => new mongoose.Types.ObjectId(id) as any)
        : [];

    user.status = UserStatus.ACTIVE;
    user.isActive = true;
    user.communities = communityObjectIds as typeof user.communities;

    const savedUser = await user.save();

    // Add mentor to each community's mentors array
    for (const communityId of communityObjectIds) {
      await this.communityModel
        .findByIdAndUpdate(communityId, { $addToSet: { mentors: savedUser._id } })
        .exec();
    }

    // Send approval email (non-blocking)
    const communityDocs = await this.communityModel
      .find({ _id: { $in: communityObjectIds } })
      .select('name')
      .exec();
    const communityNames = communityDocs.map((c) => c.name).join(', ') || undefined;

    this.emailService
      .sendMentorApprovedEmail(user.email, user.name ?? 'there', customMessage, communityNames)
      .catch((error) => {
        console.error('Failed to send mentor approval email:', error);
      });

    return savedUser;
  }

  async rejectUser(id: string, dto: RejectMentorDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.status = UserStatus.REJECTED;

    // Optionally assign to a community as a member (hacker)
    if (dto.communityId && mongoose.Types.ObjectId.isValid(dto.communityId)) {
      const communityIdStr = dto.communityId;
      const community = await this.communityModel.findById(communityIdStr).exec();
      if (community) {
        user.role = UserRole.MEMBER;
        user.communities = [new mongoose.Types.ObjectId(communityIdStr) as any];
        user.status = UserStatus.ACTIVE;
        user.isActive = true;
        await this.communityModel
          .findByIdAndUpdate(communityIdStr, { $addToSet: { members: user._id } })
          .exec();
      }
    }

    const savedUser = await user.save();

    // Send rejection email (non-blocking)
    this.emailService
      .sendMentorRejectedEmail(user.email, user.name ?? 'there', dto.reason)
      .catch((error) => {
        console.error('Failed to send mentor rejection email:', error);
      });

    return savedUser;
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

      const savedUser = await existingUser.save();

      // Fetch GitHub profile + send org invitation asynchronously (non-blocking)
      if (githubHandle) {
        this.enrichUserWithGitHub(savedUser._id.toString(), githubHandle, email);
      }

      // Send confirmation email (non-blocking)
      this.emailService.sendCommunityJoinConfirmation(email, name, communities).catch((error) => {
        console.error('Failed to send subscription confirmation email:', error);
      });

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

    const savedUser = await newUser.save();

    // Fetch GitHub profile + send org invitation asynchronously (non-blocking)
    if (githubHandle) {
      this.enrichUserWithGitHub(savedUser._id.toString(), githubHandle, email);
    }

    // Send confirmation email (non-blocking)
    this.emailService.sendCommunityJoinConfirmation(email, name, communities).catch((error) => {
      console.error('Failed to send subscription confirmation email:', error);
    });

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

    const savedMentor = await newMentor.save();

    // Fetch GitHub profile + send org invitation asynchronously (non-blocking)
    if (githubHandle) {
      this.enrichUserWithGitHub(savedMentor._id.toString(), githubHandle, email);
    }

    // Send confirmation email (non-blocking)
    this.emailService.sendMentorApplicationConfirmation(email, name).catch((error) => {
      console.error('Failed to send mentor application email:', error);
    });

    return savedMentor;
  }

  /**
   * Fetch GitHub profile, update user, and send org invitation asynchronously (fire and forget)
   */
  private enrichUserWithGitHub(userId: string, githubHandle: string, userEmail: string): void {
    this.githubService
      .fetchProfileAndInviteToOrg(githubHandle, userEmail)
      .then((profile) => {
        if (profile) {
          return this.userModel.findByIdAndUpdate(userId, { githubProfile: profile }).exec();
        }
      })
      .catch((error) => {
        console.error(
          `Failed to enrich user ${userId} with GitHub: ${error instanceof Error ? error.message : String(error)}`
        );
      });
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
      expertise: 1,
      motivation: 1,
      title: 1,
      description: 1,
      socialLinks: 1,
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

  /**
   * Bulk update user status
   */
  async bulkUpdateStatus(userIds: string[], status: UserStatus): Promise<{ updated: number }> {
    const result = await this.userModel
      .updateMany({ _id: { $in: userIds } }, { $set: { status } })
      .exec();

    return { updated: result.modifiedCount };
  }
}
