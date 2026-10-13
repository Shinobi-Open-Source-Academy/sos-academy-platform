import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { Community } from '../community/schemas/community.schema';
import { EmailService } from '../email/email.service';
import { GitHubService } from '../github/github.service';
import { User } from './schemas/user.schema';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  const exec = jest.fn();
  const userModel = {
    findById: jest.fn(() => ({ exec })),
    findByIdAndUpdate: jest.fn(() => ({ exec })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Community.name), useValue: {} },
        { provide: EmailService, useValue: {} },
        { provide: GitHubService, useValue: {} },
      ],
    }).compile();
    service = module.get(UserService);
  });

  describe('update', () => {
    it('hashes the password instead of storing it in plain text', async () => {
      exec.mockResolvedValue({ _id: 'u1' });

      await service.update('u1', { password: 'new-password' });

      const [, update] = userModel.findByIdAndUpdate.mock.calls[0] as unknown as [
        string,
        { password: string },
      ];
      expect(update.password).not.toBe('new-password');
      await expect(bcrypt.compare('new-password', update.password)).resolves.toBe(true);
    });
  });

  describe('updateMentorProfile', () => {
    it('sets provided fields, clears nulls and leaves the rest untouched', async () => {
      exec.mockResolvedValue({
        title: 'Staff Engineer',
        socialLinks: { github: 'https://github.com/me', website: 'https://me.dev' },
      });

      const profile = await service.updateMentorProfile('u1', {
        title: 'Staff Engineer',
        github: 'https://github.com/me',
        linkedin: null,
      });

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'u1',
        {
          $set: { title: 'Staff Engineer', 'socialLinks.github': 'https://github.com/me' },
          $unset: { 'socialLinks.linkedin': '' },
        },
        { new: true, runValidators: true }
      );
      expect(profile).toEqual({
        title: 'Staff Engineer',
        description: null,
        socialLinks: {
          github: 'https://github.com/me',
          linkedin: null,
          twitter: null,
          website: 'https://me.dev',
        },
      });
    });

    it('returns the current profile without writing when nothing changes', async () => {
      exec.mockResolvedValue({ description: 'Hi' });

      const profile = await service.updateMentorProfile('u1', {});

      expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(profile.description).toBe('Hi');
    });

    it('throws when the user does not exist', async () => {
      exec.mockResolvedValue(null);

      await expect(service.updateMentorProfile('missing', { title: 'x' })).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });
});
