import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ICurrentUser } from '@sos-academy/shared';

/**
 * Lets through an admin (admin panel session) or the user the `:id` route param refers to
 * (JWT, set by `OptionalJwtAuthGuard`). Sets `request.isAdmin` so handlers can tell them apart.
 */
@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (req.session?.adminId) {
      req.isAdmin = true;
      return true;
    }

    const user: ICurrentUser | undefined = req.user;
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }
    if (String(user._id) !== String(req.params.id)) {
      throw new ForbiddenException('You can only update your own profile');
    }

    req.isAdmin = false;
    return true;
  }
}
