import { ICurrentUser } from '@sos-academy/shared';

declare global {
  namespace Express {
    interface Request {
      user?: ICurrentUser;
    }
  }
}
