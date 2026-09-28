import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@sos-academy/shared';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Require a valid JWT and, when roles are given, one of those roles.
 * @example `@Auth(UserRole.MENTOR, UserRole.KAGE)`
 */
export const Auth = (...roles: UserRole[]) =>
  applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
