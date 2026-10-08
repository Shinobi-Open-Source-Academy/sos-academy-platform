import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from '@sos-academy/shared';
import { SelfOrAdminGuard } from './self-or-admin.guard';

const context = (req: Record<string, unknown>) =>
  ({ switchToHttp: () => ({ getRequest: () => req }) }) as never;

const user = (id: string) => ({
  _id: id,
  email: 'user@example.com',
  name: 'User',
  role: UserRole.MEMBER,
  status: UserStatus.ACTIVE,
  isActive: true,
});

describe('SelfOrAdminGuard', () => {
  const guard = new SelfOrAdminGuard();

  it('lets an admin session through and flags it', () => {
    const req: Record<string, unknown> = { session: { adminId: 'admin' }, params: { id: 'other' } };

    expect(guard.canActivate(context(req))).toBe(true);
    expect(req.isAdmin).toBe(true);
  });

  it('lets a user update their own record', () => {
    const req: Record<string, unknown> = { user: user('me'), params: { id: 'me' } };

    expect(guard.canActivate(context(req))).toBe(true);
    expect(req.isAdmin).toBe(false);
  });

  it("rejects a user updating someone else's record", () => {
    expect(() =>
      guard.canActivate(context({ user: user('me'), params: { id: 'someone-else' } }))
    ).toThrow(ForbiddenException);
  });

  it('rejects anonymous requests', () => {
    expect(() => guard.canActivate(context({ params: { id: 'me' } }))).toThrow(
      UnauthorizedException
    );
  });
});
