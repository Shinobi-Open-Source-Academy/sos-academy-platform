import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from '@sos-academy/shared';
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
  let squadModel: jest.Mock & {
    find: jest.Mock;
    findById: jest.Mock;
    exists: jest.Mock;
    findOneAndUpdate: jest.Mock;
  };
  let existsExec: jest.Mock;
  let updateExec: jest.Mock;
  let save: jest.Mock;
  let query: Record<string, jest.Mock>;

  const mentorId = id();
  const communityId = id();

  beforeEach(async () => {
    save = jest.fn();
    squadModel = Object.assign(
      jest.fn().mockImplementation((doc) => ({ ...doc, save: save.mockResolvedValue(doc) })),
      { find: jest.fn(), findById: jest.fn(), exists: jest.fn(), findOneAndUpdate: jest.fn() }
    );
    existsExec = jest.fn().mockResolvedValue(null);
    squadModel.exists.mockReturnValue({ exec: existsExec });
    updateExec = jest.fn();
    squadModel.findOneAndUpdate.mockReturnValue({ exec: updateExec });
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
        status: UserStatus.ACTIVE,
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
        memberJoinedAt: {
          [members[0]]: expect.any(Date),
          [members[1]]: expect.any(Date),
        },
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
        memberJoinedAt: {},
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
        return { _id: userId, role: UserRole.MENTOR, status: UserStatus.ACTIVE };
      });

      await expect(
        service.create({ mentor: mentorId, community: communityId, members: [unknown] })
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(save).not.toHaveBeenCalled();
    });
    it('rejects an unapproved mentor', async () => {
      userService.findOne.mockResolvedValueOnce({
        _id: mentorId,
        role: UserRole.MENTOR,
        status: UserStatus.APPLIED_MENTOR,
      });

      await expect(
        service.create({ mentor: mentorId, community: communityId })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a member who is already in another active squad', async () => {
      existsExec.mockResolvedValue({ _id: id() });

      await expect(
        service.create({ mentor: mentorId, community: communityId, members: [id()] })
      ).rejects.toBeInstanceOf(ConflictException);
      expect(save).not.toHaveBeenCalled();
    });

    it('turns a duplicate key from the one-squad index into a conflict', async () => {
      save.mockRejectedValue(Object.assign(new Error('E11000'), { code: 11000 }));
      squadModel.mockImplementation((doc) => ({ ...doc, save }));

      await expect(
        service.create({ mentor: mentorId, community: communityId, members: [id()] })
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('addMember', () => {
    const squadId = id();
    const menteeId = id();
    const squadDoc = (overrides: Record<string, unknown> = {}) => ({
      _id: squadId,
      mentor: new Types.ObjectId(mentorId),
      members: [],
      capacity: 2,
      isActive: true,
      ...overrides,
    });

    it('adds an approved mentee with an atomic capacity check', async () => {
      const populated = { _id: squadId, members: [{ _id: menteeId }] };
      query.exec.mockResolvedValueOnce(squadDoc()).mockResolvedValueOnce(populated);
      updateExec.mockResolvedValue({ _id: squadId });

      await expect(service.addMember(squadId, menteeId)).resolves.toBe(populated);
      expect(squadModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: squadId,
          isActive: true,
          members: { $ne: menteeId },
          $expr: { $lt: [{ $size: '$members' }, '$capacity'] },
        },
        {
          $addToSet: { members: menteeId },
          $set: { [`memberJoinedAt.${menteeId}`]: expect.any(Date) },
        },
        { new: true }
      );
      // the one-squad check ignores the squad being edited
      expect(squadModel.exists).toHaveBeenCalledWith({
        isActive: true,
        members: menteeId,
        _id: { $ne: squadId },
      });
    });

    it('rejects adding past capacity with a clear error', async () => {
      query.exec.mockResolvedValueOnce(squadDoc());
      updateExec.mockResolvedValue(null);

      await expect(service.addMember(squadId, menteeId)).rejects.toThrow(
        'Squad is at capacity (2/2)'
      );
    });

    it('rejects a mentee who is already in another active squad', async () => {
      query.exec.mockResolvedValueOnce(squadDoc());
      existsExec.mockResolvedValue({ _id: id() });

      await expect(service.addMember(squadId, menteeId)).rejects.toBeInstanceOf(ConflictException);
      expect(squadModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects a user who is already in this squad', async () => {
      query.exec.mockResolvedValueOnce(squadDoc({ members: [new Types.ObjectId(menteeId)] }));

      await expect(service.addMember(squadId, menteeId)).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejects the squad mentor', async () => {
      query.exec.mockResolvedValueOnce(squadDoc());

      await expect(service.addMember(squadId, mentorId)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it.each([
      ['a mentor', { role: UserRole.MENTOR, status: UserStatus.ACTIVE }],
      ['a pending member', { role: UserRole.MEMBER, status: UserStatus.PENDING }],
    ])('rejects %s', async (_, user) => {
      query.exec.mockResolvedValueOnce(squadDoc());
      userService.findOne.mockResolvedValueOnce({ _id: menteeId, ...user });

      await expect(service.addMember(squadId, menteeId)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(squadModel.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('rejects an inactive squad', async () => {
      query.exec.mockResolvedValueOnce(squadDoc({ isActive: false }));

      await expect(service.addMember(squadId, menteeId)).rejects.toBeInstanceOf(
        BadRequestException
      );
    });

    it('throws when the squad does not exist', async () => {
      query.exec.mockResolvedValueOnce(null);

      await expect(service.addMember(squadId, menteeId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('removeMember', () => {
    const squadId = id();
    const menteeId = id();

    it('pulls the mentee out of the squad', async () => {
      const populated = { _id: squadId, members: [] };
      updateExec.mockResolvedValue({ _id: squadId });
      query.exec.mockResolvedValueOnce(populated);

      await expect(service.removeMember(squadId, menteeId)).resolves.toBe(populated);
      expect(squadModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: squadId, members: menteeId },
        { $pull: { members: menteeId }, $unset: { [`memberJoinedAt.${menteeId}`]: '' } }
      );
    });

    it('says when the user is not in the squad', async () => {
      updateExec.mockResolvedValue(null);
      squadModel.exists.mockResolvedValue({ _id: squadId });

      await expect(service.removeMember(squadId, menteeId)).rejects.toThrow(
        'is not a member of this squad'
      );
    });

    it('says when the squad does not exist', async () => {
      updateExec.mockResolvedValue(null);
      squadModel.exists.mockResolvedValue(null);

      await expect(service.removeMember(squadId, menteeId)).rejects.toThrow('not found');
    });
  });

  describe('findMine', () => {
    it("returns only the mentor's active squads, with each member's join date and no email", async () => {
      const naruto = new Types.ObjectId();
      const sakura = new Types.ObjectId();
      const created = new Date('2026-09-01');
      query.lean = jest.fn().mockReturnThis();
      query.exec.mockResolvedValue([
        {
          _id: 'squad-1',
          community: { name: 'JavaScript', slug: 'javascript' },
          capacity: 5,
          createdAt: created,
          memberJoinedAt: { [String(naruto)]: new Date('2026-09-20') },
          members: [
            {
              _id: naruto,
              name: 'Naruto',
              email: 'naruto@test.local',
              githubProfile: { login: 'naruto-dev', avatarUrl: 'https://avatar' },
            },
            { _id: sakura, name: 'Sakura' },
          ],
        },
      ]);

      const roster = await service.findMine(mentorId);

      expect(squadModel.find).toHaveBeenCalledWith({ mentor: mentorId, isActive: true });
      expect(query.populate).toHaveBeenCalledWith('members', 'name githubProfile');
      expect(roster).toEqual([
        {
          id: 'squad-1',
          community: { name: 'JavaScript', slug: 'javascript' },
          capacity: 5,
          members: [
            // no recorded join date: falls back to the squad's creation
            {
              id: String(sakura),
              name: 'Sakura',
              githubLogin: null,
              avatarUrl: null,
              joinedAt: created,
            },
            {
              id: String(naruto),
              name: 'Naruto',
              githubLogin: 'naruto-dev',
              avatarUrl: 'https://avatar',
              joinedAt: new Date('2026-09-20'),
            },
          ],
        },
      ]);
    });

    it('returns an empty list for a mentor without a squad', async () => {
      query.lean = jest.fn().mockReturnThis();
      query.exec.mockResolvedValue([]);

      await expect(service.findMine(mentorId)).resolves.toEqual([]);
    });
  });

  describe('findAll', () => {
    it('filters by community and active state', async () => {
      const communityFilter = id();
      query.exec.mockResolvedValue([]);

      await service.findAll({ community: communityFilter, isActive: true });

      expect(squadModel.find).toHaveBeenCalledWith({ community: communityFilter, isActive: true });
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

  it('keeps a mentee in at most one active squad', () => {
    const index = SquadSchema.indexes().find(([, options]) => options?.unique);

    expect(index).toEqual([
      { members: 1 },
      expect.objectContaining({
        unique: true,
        partialFilterExpression: { isActive: true, 'members.0': { $exists: true } },
      }),
    ]);
  });

  it('defaults capacity to 5 and isActive to true', () => {
    expect(SquadSchema.path('capacity').options.default).toBe(DEFAULT_SQUAD_CAPACITY);
    expect(DEFAULT_SQUAD_CAPACITY).toBe(5);
    expect(SquadSchema.path('isActive').options.default).toBe(true);
  });
});
