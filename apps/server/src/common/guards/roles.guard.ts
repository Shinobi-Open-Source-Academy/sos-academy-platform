import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@sos-academy/shared';

/**
 * Role-based authorization guard
 * Checks if the authenticated user has the required role(s)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(`Access denied. Required role(s): ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}

/**
 * Decorator to set required roles for a route
 */
export const Roles = (...roles: UserRole[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata('roles', roles, descriptor.value);
    } else {
      Reflect.defineMetadata('roles', roles, target);
    }
  };
};
