import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './roles.guard';

/**
 * Lets in either an admin-panel session or a platform user holding one of the `@Roles()`.
 *
 * Admins log into `apps/admin` with a session cookie and have no JWT, while kages use the
 * platform's JWT: the same route has to accept both.
 */
@Injectable()
export class AdminOrRolesGuard implements CanActivate {
  private readonly jwtAuthGuard = new JwtAuthGuard();
  private readonly rolesGuard: RolesGuard;

  constructor(reflector: Reflector) {
    this.rolesGuard = new RolesGuard(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.switchToHttp().getRequest().session?.adminId) {
      return true;
    }

    // Throws 401 without a valid token, then 403 without one of the roles
    await this.jwtAuthGuard.canActivate(context);
    return this.rolesGuard.canActivate(context);
  }
}
