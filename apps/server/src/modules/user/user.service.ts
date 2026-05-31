import {
  ConflictException,
  ForbiddenException,
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
import { InviteAdminDto } from './dto/invite-admin.dto';
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

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      // Guard: application already under review
      if (
        existingUser.status === UserStatus.APPLIED_MENTOR ||
        existingUser.status === UserStatus.PENDING_REVIEW
      ) {
        throw new ConflictException('A mentor application for this email is already under review');
      }

      // Guard: already an active mentor
      if (existingUser.role === UserRole.MENTOR && existingUser.status === UserStatus.ACTIVE) {
        throw new ConflictException('This user is already an active mentor');
      }

      // Upgrade existing user to mentor applicant — preserve communities, skills, etc.
      existingUser.role = UserRole.MENTOR;
      existingUser.status = UserStatus.APPLIED_MENTOR;
      existingUser.source = 'mentor-application';
      if (expertise) existingUser.expertise = expertise;
      if (motivation) existingUser.motivation = motivation;
      if (name) existingUser.name = name;

      const updatedUser = await existingUser.save();

      if (githubHandle) {
        this.enrichUserWithGitHub(updatedUser._id.toString(), githubHandle, email);
      }

      this.emailService
        .sendMentorApplicationConfirmation(email, existingUser.name ?? name)
        .catch((error) => {
          console.error('Failed to send mentor application email:', error);
        });

      return updatedUser;
    }

    // New user — create mentor application
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

    if (githubHandle) {
      this.enrichUserWithGitHub(savedMentor._id.toString(), githubHandle, email);
    }

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

    // Merge new community IDs into existing communities — preserves a member's existing communities
    if (communityObjectIds.length > 0) {
      const existingIds = new Set(user.communities.map((id) => id.toString()));
      const toAdd = communityObjectIds.filter((id) => !existingIds.has(id.toString()));
      user.communities = [...user.communities, ...toAdd] as typeof user.communities;
    }

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

    // Rejected mentors always become active hackers (preserves existing communities)
    user.role = UserRole.MEMBER;
    user.status = UserStatus.ACTIVE;
    user.isActive = true;

    // Optionally assign to a specific community
    if (dto.communityId && mongoose.Types.ObjectId.isValid(dto.communityId)) {
      const communityIdStr = dto.communityId;
      const community = await this.communityModel.findById(communityIdStr).exec();
      if (community) {
        const communityObjId = new mongoose.Types.ObjectId(communityIdStr) as any;
        const alreadyInCommunity = user.communities.some((id) => id.toString() === communityIdStr);
        if (!alreadyInCommunity) {
          user.communities = [...user.communities, communityObjId] as typeof user.communities;
        }
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

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      // Guard: application already under review
      if (
        existingUser.status === UserStatus.APPLIED_MENTOR ||
        existingUser.status === UserStatus.PENDING_REVIEW
      ) {
        throw new ConflictException('A mentor application for this email is already under review');
      }

      // Guard: already an active mentor
      if (existingUser.role === UserRole.MENTOR && existingUser.status === UserStatus.ACTIVE) {
        throw new ConflictException('This user is already an active mentor');
      }

      // Upgrade existing user to mentor applicant — preserve communities, skills, etc.
      existingUser.role = UserRole.MENTOR;
      existingUser.status = UserStatus.APPLIED_MENTOR;
      existingUser.source = 'mentor-application';
      if (expertise) existingUser.expertise = expertise;
      if (motivation) existingUser.motivation = motivation;
      if (name) existingUser.name = name;

      const updatedUser = await existingUser.save();

      if (githubHandle) {
        this.enrichUserWithGitHub(updatedUser._id.toString(), githubHandle, email);
      }

      this.emailService
        .sendMentorApplicationConfirmation(email, existingUser.name ?? name)
        .catch((error) => {
          console.error('Failed to send mentor application email:', error);
        });

      return updatedUser;
    }

    // New user — create mentor application
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

    if (githubHandle) {
      this.enrichUserWithGitHub(savedMentor._id.toString(), githubHandle, email);
    }

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
   * Admin login — sets server-side session on success
   */
  async adminLogin(
    adminLoginDto: AdminLoginDto,
    req: any
  ): Promise<{
    success: boolean;
    isSuperAdmin: boolean;
    admin: { id: string; name: string; email: string };
  }> {
    const { email, password } = adminLoginDto;

    const adminUser = await this.userModel
      .findOne({ email, role: UserRole.KAGE, status: UserStatus.ACTIVE })
      .select('+password isSuperAdmin name email')
      .exec();

    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    req.session.adminId = (adminUser._id as any).toString();
    req.session.isSuperAdmin = adminUser.isSuperAdmin ?? false;

    return {
      success: true,
      isSuperAdmin: adminUser.isSuperAdmin ?? false,
      admin: { id: req.session.adminId, name: adminUser.name, email: adminUser.email },
    };
  }

  /**
   * Destroy the current admin session (logout)
   */
  async adminLogout(req: any): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err: Error) => (err ? reject(err) : resolve()));
    });
  }

  /**
   * Return the currently authenticated admin from session
   */
  async getAdminMe(
    req: any
  ): Promise<{ id: string; name: string; email: string; isSuperAdmin: boolean }> {
    const adminUser = await this.userModel.findById(req.session.adminId).exec();
    if (!adminUser) throw new UnauthorizedException('Session expired');
    return {
      id: (adminUser._id as any).toString(),
      name: adminUser.name,
      email: adminUser.email,
      isSuperAdmin: req.session.isSuperAdmin ?? false,
    };
  }

  /**
   * List all admin (KAGE) accounts — super admin only
   */
  async listAdmins(): Promise<
    {
      id: string;
      name: string;
      email: string;
      status: string;
      isSuperAdmin: boolean;
      createdAt: Date;
    }[]
  > {
    const admins = await this.userModel
      .find({ role: UserRole.KAGE })
      .select('name email status isSuperAdmin createdAt')
      .lean()
      .exec();

    return admins.map((a: any) => ({
      id: a._id.toString(),
      name: a.name,
      email: a.email,
      status: a.status,
      isSuperAdmin: a.isSuperAdmin ?? false,
      createdAt: a.createdAt,
    }));
  }

  /**
   * Invite a new admin — super admin only
   */
  async inviteAdmin(dto: InviteAdminDto): Promise<{ id: string; name: string; email: string }> {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) throw new ConflictException('A user with this email already exists');

    const hashed = await this.hashPassword(dto.password);
    const admin = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: UserRole.KAGE,
      status: UserStatus.ACTIVE,
      isActive: true,
      isSuperAdmin: false,
    });

    return { id: (admin._id as any).toString(), name: admin.name, email: admin.email };
  }

  /**
   * Revoke an admin's access — super admin only, cannot self-revoke or revoke super admin
   */
  async revokeAdmin(targetId: string, currentAdminId: string): Promise<void> {
    if (targetId === currentAdminId) {
      throw new ForbiddenException('Cannot revoke your own access');
    }
    const target = await this.userModel.findById(targetId).exec();
    if (!target) throw new NotFoundException('Admin not found');
    if (target.role !== UserRole.KAGE) throw new NotFoundException('Admin not found');
    if (target.isSuperAdmin) throw new ForbiddenException('Cannot revoke the super admin');

    await this.userModel
      .findByIdAndUpdate(targetId, { status: UserStatus.INACTIVE, isActive: false })
      .exec();
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
