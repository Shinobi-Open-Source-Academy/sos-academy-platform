import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserRole, UserStatus } from '@sos-academy/shared';
import { User } from '../user/schemas/user.schema';
import { CommunityStatsDto } from './dto/community-stats.dto';
import { Community, CommunityDocument } from './schemas/community.schema';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name) private communityModel: Model<CommunityDocument>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async findAll(): Promise<Community[]> {
    return this.communityModel
      .find({ isActive: true })
      .select('-__v')
      .populate('kage', 'name email')
      .populate('mentors', 'name email')
      .populate('members', 'name email')
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<Community | null> {
    return this.communityModel
      .findById(id)
      .select('-__v')
      .populate('kage', 'name email')
      .populate('mentors', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  async findByName(name: string): Promise<Community | null> {
    return this.communityModel
      .findOne({ name, isActive: true })
      .select('-__v')
      .populate('kage', 'name email')
      .populate('mentors', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  async findBySlug(slug: string): Promise<Community | null> {
    // Return data immediately from DB - projects are fetched separately via projects API
    const community = await this.communityModel
      .findOne({ slug, isActive: true })
      .select('-__v')
      .populate({
        path: 'kage',
        select: 'name email title description githubProfile',
      })
      .populate({
        path: 'mentors',
        select: 'name email title description githubProfile socialLinks',
      })
      .populate({
        path: 'members',
        select: 'name email githubProfile',
      })
      .lean()
      .exec();

    if (!community) {
      return null;
    }

    const memberCount = await this.userModel
      .countDocuments({
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        communities: community._id,
      })
      .exec();

    // Add member count to the community object
    return {
      ...community,
      memberCount,
    } as Community & { memberCount: number };
  }

  async getStats(): Promise<CommunityStatsDto> {
    const stats = await this.communityModel.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: null,
          totalCommunities: { $sum: 1 },
          totalMembers: { $sum: { $size: '$members' } },
          totalMentors: { $sum: { $size: '$mentors' } },
          totalProjects: { $sum: { $size: '$projects' } },
        },
      },
    ]);

    return (
      stats[0] || {
        totalCommunities: 0,
        totalMembers: 0,
        totalMentors: 0,
        totalProjects: 0,
      }
    );
  }
}
