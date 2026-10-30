import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole } from '@sos-academy/shared';
import { Model } from 'mongoose';
import { CommunityService } from '../community/community.service';
import { UserService } from '../user/user.service';
import { CreateSquadDto } from './dto/create-squad.dto';
import { DEFAULT_SQUAD_CAPACITY, Squad, SquadDocument } from './schemas/squad.schema';

@Injectable()
export class SquadService {
  constructor(
    @InjectModel(Squad.name) private squadModel: Model<SquadDocument>,
    private readonly userService: UserService,
    private readonly communityService: CommunityService
  ) {}

  async create(createSquadDto: CreateSquadDto): Promise<Squad> {
    const { mentor, community, capacity = DEFAULT_SQUAD_CAPACITY } = createSquadDto;
    const members = [...new Set(createSquadDto.members ?? [])];

    if (members.length > capacity) {
      throw new BadRequestException(
        `Squad has ${members.length} members but a capacity of ${capacity}`
      );
    }
    if (members.includes(mentor)) {
      throw new BadRequestException('A mentor cannot be a member of their own squad');
    }

    const mentorUser = await this.userService.findOne(mentor);
    if (mentorUser.role !== UserRole.MENTOR && mentorUser.role !== UserRole.KAGE) {
      throw new BadRequestException(`User with ID ${mentor} is not a mentor`);
    }

    const existingCommunity = await this.communityService.findById(community);
    if (!existingCommunity) {
      throw new NotFoundException(`Community with ID ${community} not found`);
    }

    await Promise.all(members.map((memberId) => this.userService.findOne(memberId)));

    const squad = new this.squadModel({ mentor, community, members, capacity });
    return squad.save();
  }

  async findById(id: string): Promise<Squad> {
    const squad = await this.squadModel
      .findById(id)
      .select('-__v')
      .populate('mentor', 'name email')
      .populate('community', 'name slug')
      .populate('members', 'name email githubProfile')
      .exec();
    if (!squad) {
      throw new NotFoundException(`Squad with ID ${id} not found`);
    }
    return squad;
  }

  /**
   * Returns the active squads a user belongs to, either as a member or as the mentor.
   */
  async findByUser(userId: string): Promise<Squad[]> {
    return this.squadModel
      .find({ isActive: true, $or: [{ members: userId }, { mentor: userId }] })
      .select('-__v')
      .populate('mentor', 'name email')
      .populate('community', 'name slug')
      .populate('members', 'name email githubProfile')
      .sort({ createdAt: -1 })
      .exec();
  }
}
