import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Community, CommunityDocument } from './schemas/community.schema';

@Injectable()
export class CommunityService {
  constructor(@InjectModel(Community.name) private communityModel: Model<CommunityDocument>) {}

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

  async getStats(): Promise<{
    totalCommunities: number;
    totalMembers: number;
    totalMentors: number;
    totalProjects: number;
  }> {
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
