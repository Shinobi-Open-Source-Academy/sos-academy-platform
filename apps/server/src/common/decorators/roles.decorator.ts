import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@sos-academy/shared';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route or controller to users with one of the given roles.
 * Must run after an authentication guard that sets `request.user` (see `Auth`).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
