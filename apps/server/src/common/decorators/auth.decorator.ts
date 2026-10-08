import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@sos-academy/shared';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Require a valid JWT and, when roles are given, one of those roles. Without roles, the
 * controller's `@Roles()` (if any) still applies.
 * @example `@Auth(UserRole.MENTOR, UserRole.KAGE)`
 */
export const Auth = (...roles: UserRole[]) =>
  applyDecorators(
    // Without roles, only require a login and keep the controller's roles (if any)
    ...(roles.length ? [Roles(...roles)] : []),
    UseGuards(JwtAuthGuard, RolesGuard)
  );
