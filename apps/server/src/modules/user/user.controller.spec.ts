import { ForbiddenException } from '@nestjs/common';
import { UserRole, UserStatus } from '@sos-academy/shared';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController.update', () => {
  const userService = { update: jest.fn().mockResolvedValue({ _id: 'me', name: 'Updated' }) };
  const controller = new UserController(userService as unknown as UserService);

  beforeEach(() => userService.update.mockClear());

  const dto = (body: Record<string, unknown>) => plainToInstance(UpdateUserDto, body);

  it('lets users change their own profile fields', async () => {
    const body = dto({
      name: 'Updated',
      description: 'Hi',
      socialLinks: { github: 'https://github.com/me' },
    });

    await controller.update('me', body, { isAdmin: false });

    expect(userService.update).toHaveBeenCalledWith('me', body);
  });

  it.each([
    [{ role: UserRole.KAGE }, 'role'],
    [{ status: UserStatus.ACTIVE }, 'status'],
    [{ password: 'secret' }, 'password'],
    [{ name: 'x', role: UserRole.MENTOR }, 'role'],
  ])('rejects privileged field %o for non-admins', async (body, field) => {
    await expect(controller.update('me', dto(body), { isAdmin: false })).rejects.toThrow(
      new ForbiddenException(`Only an admin can change: ${field}`)
    );
    expect(userService.update).not.toHaveBeenCalled();
  });

  it('lets admins change privileged fields', async () => {
    const body = dto({ role: UserRole.MENTOR, status: UserStatus.ACTIVE });

    await controller.update('someone', body, { isAdmin: true });

    expect(userService.update).toHaveBeenCalledWith('someone', body);
  });
});
