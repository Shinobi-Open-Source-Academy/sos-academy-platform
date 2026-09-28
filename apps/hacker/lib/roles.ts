import { UserRole } from '@sos-academy/shared';

/**
 * Roles allowed in the mentor area (`/mentor/*`). Kages lead communities and can see
 * everything mentors can. The API enforces the same rule with `@Auth(...MENTOR_ROLES)`.
 */
export const MENTOR_ROLES: UserRole[] = [UserRole.MENTOR, UserRole.KAGE];

export const isMentorRole = (role: unknown): boolean => MENTOR_ROLES.includes(role as UserRole);
