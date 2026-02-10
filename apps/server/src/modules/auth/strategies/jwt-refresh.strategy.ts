import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { envConfig } from 'apps/server/src/common/config/env.config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../schemas/session.schema';
import { ICurrentUser } from '@sos-academy/shared';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(@InjectModel(Session.name) private sessionModel: Model<SessionDocument>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['refresh_token'];
          }
          if (!token && request.body && request.body.refreshToken) {
            token = request.body.refreshToken;
          }
          return token;
        },
      ]),
      secretOrKey: envConfig.jwt.refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<ICurrentUser> {
    const refreshToken = req.cookies?.['refresh_token'] || req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const session = await this.sessionModel
      .findOne({
        user: payload.sub,
      })
      .exec();

    if (!session) {
      throw new UnauthorizedException('Session not found or expired');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, session.refreshToken);

    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionModel.deleteOne({ _id: session._id }).exec();
      throw new UnauthorizedException('Session has expired');
    }

    return {
      _id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      status: payload.status,
      isActive: payload.isActive,
    };
  }
}
