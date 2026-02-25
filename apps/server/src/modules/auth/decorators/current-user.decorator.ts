import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUser } from '@sos-academy/shared';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
