import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like `JwtAuthGuard`, but never rejects: `request.user` is set when a valid token is sent
 * and left empty otherwise. Lets another guard decide what an anonymous request may do.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // biome-ignore lint/suspicious/noExplicitAny: signature defined by AuthGuard
  handleRequest(_err: unknown, user: any) {
    return user || undefined;
  }
}
