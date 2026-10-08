import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { IGitHubProfile } from '@sos-academy/shared';
import { Model } from 'mongoose';
import { envConfig } from '../../common/config/env.config';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { hashRefreshToken } from './refresh-token';
import { Session, SessionDocument } from './schemas/session.schema';

/**
 * When a session created now expires, based on JWT_REFRESH_EXPIRATION (e.g. "7d", "30m")
 */
export function refreshExpiryDate(expiresIn = envConfig.jwt.refreshExpiration): Date {
  const expiryDate = new Date();
  const amount = Number.parseInt(expiresIn, 10);
  if (expiresIn.endsWith('d')) {
    expiryDate.setDate(expiryDate.getDate() + amount);
  } else if (expiresIn.endsWith('m')) {
    expiryDate.setMinutes(expiryDate.getMinutes() + amount);
  } else {
    expiryDate.setDate(expiryDate.getDate() + 7); // Default 7d
  }
  return expiryDate;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>
  ) {}

  async handleGitHubOAuth(profile: IGitHubProfile) {
    // Accounts are matched and created by email, which GitHub only shares with the user:email scope
    if (!profile.email) {
      throw new UnauthorizedException(
        'Your GitHub account has no email address we can use. Add a verified email on GitHub and try again.'
      );
    }

    const user = await this.userService.findOrCreateFromGitHub(profile);

    if (!user) {
      throw new UnauthorizedException('Failed to validate GitHub user');
    }
    if (user.isActive === false) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    return user;
  }

  async login(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: envConfig.jwt.refreshSecret,
      expiresIn: envConfig.jwt.refreshExpiration as JwtSignOptions['expiresIn'],
    });

    await this.createSession(user._id.toString(), refreshToken);

    // Update last login
    await this.userService.updateLastLogin(user._id.toString());

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Exchange a refresh token for a new access token. The refresh token is rotated: the session it
   * belongs to now stores the new one, so each refresh token can only be used once.
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: envConfig.jwt.refreshSecret,
      });

      // A user has one session per login (browser/device): find the one this token belongs to
      const session = await this.sessionModel
        .findOne({
          user: payload.sub,
          refreshToken: hashRefreshToken(refreshToken),
          expiresAt: { $gt: new Date() },
        })
        .exec();
      if (!session) {
        throw new UnauthorizedException('Session not found or expired');
      }

      const user = await this.userService.findOne(payload.sub);
      if (user.isActive === false) {
        await this.logout(payload.sub);
        throw new UnauthorizedException('This account has been deactivated');
      }

      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: envConfig.jwt.refreshSecret,
        expiresIn: envConfig.jwt.refreshExpiration as JwtSignOptions['expiresIn'],
      });

      session.refreshToken = hashRefreshToken(newRefreshToken);
      session.expiresAt = refreshExpiryDate();
      await session.save();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      this.logger.warn(`Token refresh failed: ${error instanceof Error ? error.message : error}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.sessionModel.deleteMany({ user: userId }).exec();
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ) {
    const session = new this.sessionModel({
      user: userId,
      refreshToken: hashRefreshToken(refreshToken),
      expiresAt: refreshExpiryDate(),
      userAgent,
      ipAddress,
    });

    await session.save();
  }
}
