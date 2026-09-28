import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@sos-academy/shared';
import { Types } from 'mongoose';
import { CommunityService } from '../community/community.service';
import { UserService } from '../user/user.service';
import { DEFAULT_SQUAD_CAPACITY, Squad, SquadSchema } from './schemas/squad.schema';
import { SquadService } from './squad.service';

const id = () => new Types.ObjectId().toString();

describe('SquadService', () => {
  let service: SquadService;
  let userService: { findOne: jest.Mock };
  let communityService: { findById: jest.Mock };
  let squadModel: jest.Mock & { find: jest.Mock; findById: jest.Mock };
  let save: jest.Mock;
  let query: Record<string, jest.Mock>;

  const mentorId = id();
  const communityId = id();

  beforeEach(async () => {
    save = jest.fn();
    squadModel = Object.assign(
      jest.fn().mockImplementation((doc) => ({ ...doc, save: save.mockResolvedValue(doc) })),
      { find: jest.fn(), findById: jest.fn() }
    );
    query = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    squadModel.find.mockReturnValue(query);
    squadModel.findById.mockReturnValue(query);

    userService = {
      findOne: jest.fn().mockImplementation(async (userId: string) => ({
        _id: userId,
        role: userId === mentorId ? UserRole.MENTOR : UserRole.MEMBER,
      })),
    };
    communityService = { findById: jest.fn().mockResolvedValue({ _id: communityId }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SquadService,
        { provide: getModelToken(Squad.name), useValue: squadModel },
        { provide: UserService, useValue: userService },
        { provide: CommunityService, useValue: communityService },
      ],
    }).compile();

    service = module.get(SquadService);
  });

  describe('create', () => {
    it('creates a squad with a mentor, a community and a capacity', async () => {
      const members = [id(), id()];

      const squad = await service.create({
        mentor: mentorId,
        community: communityId,
        members,
        capacity: 3,
      });

      expect(squadModel).toHaveBeenCalledWith({
        mentor: mentorId,
        community: communityId,
        members,
        capacity: 3,
      });
      expect(save).toHaveBeenCalled();
      expect(squad).toMatchObject({ mentor: mentorId, community: communityId, capacity: 3 });
    });

    it('defaults capacity and members', async () => {
      await service.create({ mentor: mentorId, community: communityId });

      expect(squadModel).toHaveBeenCalledWith({
        mentor: mentorId,
        community: communityId,
        members: [],
        capacity: DEFAULT_SQUAD_CAPACITY,
      });
    });

    it('deduplicates members', async () => {
      const member = id();

      await service.create({ mentor: mentorId, community: communityId, members: [member, member] });

      expect(squadModel).toHaveBeenCalledWith(expect.objectContaining({ members: [member] }));
    });

    it('rejects more members than the capacity', async () => {
      await expect(
        service.create({
          mentor: mentorId,
          community: communityId,
          members: [id(), id()],
          capacity: 1,
        })
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(save).not.toHaveBeenCalled();
    });

    it('rejects the mentor as a member of their own squad', async () => {
      await expect(
        service.create({ mentor: mentorId, community: communityId, members: [mentorId] })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a mentor that does not have a mentor role', async () => {
      const notAMentor = id();

      await expect(
        service.create({ mentor: notAMentor, community: communityId })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an unknown community', async () => {
      communityService.findById.mockResolvedValue(null);

      await expect(
        service.create({ mentor: mentorId, community: communityId })
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects unknown members', async () => {
      const unknown = id();
      userService.findOne.mockImplementation(async (userId: string) => {
        if (userId === unknown) throw new NotFoundException();
        return { _id: userId, role: UserRole.MENTOR };
      });

      await expect(
        service.create({ mentor: mentorId, community: communityId, members: [unknown] })
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(save).not.toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('looks up active squads where the user is a member or the mentor', async () => {
      const userId = id();
      const squads = [{ mentor: mentorId, members: [userId] }];
      query.exec.mockResolvedValue(squads);

      await expect(service.findByUser(userId)).resolves.toBe(squads);
      expect(squadModel.find).toHaveBeenCalledWith({
        isActive: true,
        $or: [{ members: userId }, { mentor: userId }],
      });
    });
  });

  describe('findById', () => {
    it('throws when the squad does not exist', async () => {
      query.exec.mockResolvedValue(null);

      await expect(service.findById(id())).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

describe('SquadSchema', () => {
  it('indexes mentor/community pairs and member lookups', () => {
    const indexes = SquadSchema.indexes().map(([fields]) => fields);

    expect(indexes).toEqual(
      expect.arrayContaining([
        { mentor: 1, community: 1 },
        { members: 1, isActive: 1 },
      ])
    );
  });

  it('defaults capacity to 5 and isActive to true', () => {
    expect(SquadSchema.path('capacity').options.default).toBe(DEFAULT_SQUAD_CAPACITY);
    expect(DEFAULT_SQUAD_CAPACITY).toBe(5);
    expect(SquadSchema.path('isActive').options.default).toBe(true);
  });
});
