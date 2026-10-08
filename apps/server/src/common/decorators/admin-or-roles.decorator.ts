import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '@sos-academy/shared';
import { AdminOrRolesGuard } from '../guards/admin-or-roles.guard';
import { Roles } from './roles.decorator';

/**
 * Allow an admin-panel session, or a JWT user with one of the given roles.
 * @example `@AdminOrRoles(UserRole.KAGE)`
 */
export const AdminOrRoles = (...roles: UserRole[]) =>
  applyDecorators(Roles(...roles), UseGuards(AdminOrRolesGuard));
