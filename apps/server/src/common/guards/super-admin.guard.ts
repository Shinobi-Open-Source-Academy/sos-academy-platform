import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AdminSessionGuard } from './admin-session.guard';

@Injectable()
export class SuperAdminGuard extends AdminSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    super.canActivate(context);
    const req = context.switchToHttp().getRequest();
    if (!req.session?.isSuperAdmin) {
      throw new ForbiddenException('Super admin access required');
    }
    return true;
  }
}
