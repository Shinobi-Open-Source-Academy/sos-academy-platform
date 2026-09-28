import { Controller, ForbiddenException, Get, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ICurrentUser, UserRole, UserStatus } from '@sos-academy/shared';
import { Auth } from '../decorators/auth.decorator';
import { ROLES_KEY, Roles } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller()
@Roles(UserRole.MENTOR, UserRole.KAGE)
class MentorController {
  @Get()
  mentorOnly() {}

  @Get()
  @Roles(UserRole.KAGE)
  kageOnly() {}
}

class OpenController {
  @Get()
  open() {}
}

const user = (overrides: Partial<ICurrentUser> = {}): ICurrentUser => ({
  _id: 'user-id',
  email: 'user@example.com',
  name: 'User',
  role: UserRole.MENTOR,
  status: UserStatus.ACTIVE,
  isActive: true,
  ...overrides,
});

const context = (controller: new () => object, handler: string, requestUser?: ICurrentUser) =>
  ({
    getClass: () => controller,
    getHandler: () => controller.prototype[handler],
    switchToHttp: () => ({ getRequest: () => ({ user: requestUser }) }),
  }) as never;

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows routes without @Roles()', () => {
    expect(guard.canActivate(context(OpenController, 'open'))).toBe(true);
  });

  it.each([UserRole.MENTOR, UserRole.KAGE])('allows an active %s on a mentor route', (role) => {
    expect(guard.canActivate(context(MentorController, 'mentorOnly', user({ role })))).toBe(true);
  });

  it('rejects a member on a mentor route', () => {
    expect(() =>
      guard.canActivate(context(MentorController, 'mentorOnly', user({ role: UserRole.MEMBER })))
    ).toThrow(ForbiddenException);
  });

  it('lets a handler-level @Roles() override the controller one', () => {
    expect(() => guard.canActivate(context(MentorController, 'kageOnly', user()))).toThrow(
      ForbiddenException
    );
    expect(
      guard.canActivate(context(MentorController, 'kageOnly', user({ role: UserRole.KAGE })))
    ).toBe(true);
  });

  it('rejects a mentor applicant that has not been approved yet', () => {
    expect(() =>
      guard.canActivate(
        context(MentorController, 'mentorOnly', user({ status: UserStatus.APPLIED_MENTOR }))
      )
    ).toThrow(ForbiddenException);
  });

  it('rejects a deactivated mentor', () => {
    expect(() =>
      guard.canActivate(context(MentorController, 'mentorOnly', user({ isActive: false })))
    ).toThrow(ForbiddenException);
  });

  it('rejects unauthenticated requests', () => {
    expect(() => guard.canActivate(context(MentorController, 'mentorOnly'))).toThrow(
      UnauthorizedException
    );
  });
});

describe('Auth decorator', () => {
  it('sets the roles metadata and the JWT + roles guards', () => {
    class AuthController {
      @Auth(UserRole.MENTOR)
      handler() {}
    }
    const handler = AuthController.prototype.handler;

    expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual([UserRole.MENTOR]);
    expect(Reflect.getMetadata('__guards__', handler).map((g: { name: string }) => g.name)).toEqual(
      ['JwtAuthGuard', 'RolesGuard']
    );
  });
});
