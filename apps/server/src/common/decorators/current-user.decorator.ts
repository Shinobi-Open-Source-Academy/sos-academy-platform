import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the current authenticated user from the request
 * Usage: @CurrentUser() user: { id: string, role: string, ... }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return null;
    }

    return data ? request.user[data] : request.user;
  }
);

/**
 * Interface for the authenticated user object
 * This should match the structure of your JWT payload or session data
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}
