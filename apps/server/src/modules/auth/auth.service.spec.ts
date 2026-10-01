import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { IGitHubProfile } from '@sos-academy/shared';
import { envConfig } from '../../common/config/env.config';
import { UserService } from '../user/user.service';
import { AuthService, refreshExpiryDate } from './auth.service';
import { hashRefreshToken } from './refresh-token';
import { Session } from './schemas/session.schema';

type StoredSession = { user: string; refreshToken: string; expiresAt: Date; save: jest.Mock };

/** Minimal in-memory stand-in for the Session model */
const createSessionModel = () => {
  const sessions: StoredSession[] = [];
  const SessionModel = jest.fn().mockImplementation((doc) => {
    const session: StoredSession = {
      ...doc,
      save: jest.fn(async () => {
        if (!sessions.includes(session)) sessions.push(session);
        return session;
      }),
    };
    return session;
  }) as jest.Mock & { findOne: jest.Mock; deleteMany: jest.Mock };
  SessionModel.findOne = jest.fn(
    (filter: { user: string; refreshToken: string; expiresAt: { $gt: Date } }) => ({
      exec: async () =>
        sessions.find(
          (s) =>
            s.user === filter.user &&
            s.refreshToken === filter.refreshToken &&
            s.expiresAt > filter.expiresAt.$gt
        ) ?? null,
    })
  );
  SessionModel.deleteMany = jest.fn((filter: { user: string }) => ({
    exec: async () => {
      for (let i = sessions.length - 1; i >= 0; i--) {
        if (sessions[i].user === filter.user) sessions.splice(i, 1);
      }
    },
  }));
  return { SessionModel, sessions };
};

const LAST_UPDATED = new Date('2026-01-01T00:00:00Z');

const profile = (overrides: Partial<IGitHubProfile> = {}): IGitHubProfile => ({
  login: 'octo',
  githubId: 42,
  email: 'octo@example.com',
  lastUpdated: LAST_UPDATED,
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let sessions: StoredSession[];
  let SessionModel: ReturnType<typeof createSessionModel>['SessionModel'];
  const user = { _id: 'u1', id: 'u1', email: 'octo@example.com', role: 'MEMBER', isActive: true };
  const userService = {
    findOrCreateFromGitHub: jest.fn(),
    findOne: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    ({ SessionModel, sessions } = createSessionModel());
    userService.findOrCreateFromGitHub.mockResolvedValue({ ...user });
    userService.findOne.mockResolvedValue({ ...user });

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: new JwtService({ secret: envConfig.jwt.secret }) },
        { provide: getModelToken(Session.name), useValue: SessionModel },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('handleGitHubOAuth', () => {
    it('returns the upserted user', async () => {
      await expect(service.handleGitHubOAuth(profile())).resolves.toMatchObject({ _id: 'u1' });
      expect(userService.findOrCreateFromGitHub).toHaveBeenCalledWith(profile());
    });

    it('rejects GitHub accounts without a usable email', async () => {
      await expect(service.handleGitHubOAuth(profile({ email: undefined }))).rejects.toBeInstanceOf(
        UnauthorizedException
      );
      expect(userService.findOrCreateFromGitHub).not.toHaveBeenCalled();
    });

    it('rejects deactivated accounts', async () => {
      userService.findOrCreateFromGitHub.mockResolvedValue({ ...user, isActive: false });

      await expect(service.handleGitHubOAuth(profile())).rejects.toThrow(
        'This account has been deactivated'
      );
    });
  });

  describe('login', () => {
    it('issues tokens and stores a hashed refresh token in a new session', async () => {
      const { accessToken, refreshToken } = await service.login(user as never);

      expect(accessToken).toEqual(expect.any(String));
      expect(sessions).toHaveLength(1);
      expect(sessions[0].refreshToken).not.toBe(refreshToken);
      expect(sessions[0].refreshToken).toBe(hashRefreshToken(refreshToken));
      expect(userService.updateLastLogin).toHaveBeenCalledWith('u1');
    });
  });

  describe('refreshTokens', () => {
    it('rotates the refresh token so it can be refreshed again', async () => {
      const { refreshToken } = await service.login(user as never);
      // JWTs are second-precision: make sure the rotated token differs
      await new Promise((r) => setTimeout(r, 1100));

      const first = await service.refreshTokens(refreshToken);
      expect(first.refreshToken).not.toBe(refreshToken);
      expect(sessions[0].refreshToken).toBe(hashRefreshToken(first.refreshToken));

      await new Promise((r) => setTimeout(r, 1100));
      const second = await service.refreshTokens(first.refreshToken);
      expect(second.accessToken).toEqual(expect.any(String));
    });

    it('rejects a refresh token that was already rotated', async () => {
      const { refreshToken } = await service.login(user as never);
      await new Promise((r) => setTimeout(r, 1100));
      await service.refreshTokens(refreshToken);

      await expect(service.refreshTokens(refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });

    it('finds the right session when the user is logged in on several devices', async () => {
      await service.login(user as never);
      await new Promise((r) => setTimeout(r, 1100));
      const { refreshToken } = await service.login(user as never);
      expect(sessions).toHaveLength(2);

      await expect(service.refreshTokens(refreshToken)).resolves.toMatchObject({
        accessToken: expect.any(String),
      });
    });

    it('rejects an invalid token', async () => {
      await expect(service.refreshTokens('not-a-jwt')).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });

    it('rejects and logs out a user deactivated since login', async () => {
      const { refreshToken } = await service.login(user as never);
      userService.findOne.mockResolvedValue({ ...user, isActive: false });

      await expect(service.refreshTokens(refreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException
      );
      expect(sessions).toHaveLength(0);
    });
  });

  it('distinguishes refresh tokens that share their first 72 bytes', () => {
    const prefix = 'x'.repeat(72);
    expect(hashRefreshToken(`${prefix}A`)).not.toBe(hashRefreshToken(`${prefix}B`));
  });

  describe('refreshExpiryDate', () => {
    it.each([
      ['7d', 7 * 24 * 60],
      ['30m', 30],
    ])('handles %s', (value, minutes) => {
      const diff = (refreshExpiryDate(value).getTime() - Date.now()) / 60000;
      expect(Math.round(diff)).toBe(minutes);
    });
  });
});
