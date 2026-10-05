import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, UserStatus } from '@sos-academy/shared';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { AdminOrRoles } from '../decorators/admin-or-roles.decorator';
import { AdminOrRolesGuard } from './admin-or-roles.guard';

@AdminOrRoles(UserRole.KAGE)
class SquadsController {
  handler() {}
}

const contextFor = (request: Record<string, unknown>) =>
  ({
    getHandler: () => SquadsController.prototype.handler,
    getClass: () => SquadsController,
    switchToHttp: () => ({ getRequest: () => request }),
  }) as unknown as ExecutionContext;

const activeUser = (role: UserRole) => ({
  role,
  status: UserStatus.ACTIVE,
  isActive: true,
});

describe('AdminOrRolesGuard', () => {
  let guard: AdminOrRolesGuard;
  let jwtCanActivate: jest.SpyInstance;

  beforeEach(() => {
    guard = new AdminOrRolesGuard(new Reflector());
    jwtCanActivate = jest.spyOn(JwtAuthGuard.prototype, 'canActivate');
  });

  afterEach(() => jest.restoreAllMocks());

  it('lets an admin-panel session in without a JWT', async () => {
    await expect(guard.canActivate(contextFor({ session: { adminId: 'admin' } }))).resolves.toBe(
      true
    );
    expect(jwtCanActivate).not.toHaveBeenCalled();
  });

  it('lets a kage in with a valid JWT', async () => {
    const request: Record<string, unknown> = { session: {} };
    jwtCanActivate.mockImplementation(async () => {
      request.user = activeUser(UserRole.KAGE);
      return true;
    });

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
  });

  it('rejects a mentor or a member with a valid JWT', async () => {
    for (const role of [UserRole.MENTOR, UserRole.MEMBER]) {
      const request: Record<string, unknown> = {};
      jwtCanActivate.mockImplementation(async () => {
        request.user = activeUser(role);
        return true;
      });

      await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(
        ForbiddenException
      );
    }
  });

  it('rejects a request with neither a session nor a JWT', async () => {
    jwtCanActivate.mockRejectedValue(new UnauthorizedException());

    await expect(guard.canActivate(contextFor({}))).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
