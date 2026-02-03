import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Authentication guard to protect routes
 * This is a basic implementation that can be extended with JWT validation
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // TODO: Implement proper JWT validation here
    // For now, this is a placeholder that checks if user exists in request
    // In production, this should validate JWT token and populate request.user

    // Temporary implementation for development
    // In production, replace this with actual JWT verification
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const userId = request.headers['x-user-id'];
      const userRole = request.headers['x-user-role'] || 'MEMBER';

      if (userId) {
        request.user = {
          id: userId,
          role: userRole,
        };
        return true;
      }
    }

    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
