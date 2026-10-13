import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ICurrentUser, UserRole, UserStatus } from '@sos-academy/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Checks `request.user` (set by `JwtAuthGuard`) against the roles declared with `@Roles()`.
 *
 * The role alone isn't enough: applying as a mentor already sets `role: MENTOR` with
 * `status: APPLIED_MENTOR`, so only active, approved accounts are let through.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // A handler's roles replace the controller's, but only when it actually lists some:
    // a bare `@Auth()` / `@Roles()` on a handler must not lift the controller's restriction
    const handlerRoles = this.reflector.get<UserRole[] | undefined>(
      ROLES_KEY,
      context.getHandler()
    );
    const requiredRoles = handlerRoles?.length
      ? handlerRoles
      : this.reflector.get<UserRole[] | undefined>(ROLES_KEY, context.getClass());
    if (!requiredRoles?.length) {
      return true;
    }

    const user: ICurrentUser | undefined = context.switchToHttp().getRequest().user;
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    if (!user.isActive || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Your account is not active');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `This resource requires one of these roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
