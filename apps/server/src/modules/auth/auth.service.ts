import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { IGitHubProfile } from '@sos-academy/shared';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { Session, SessionDocument } from './schemas/session.schema';
import { envConfig } from '../../common/config/env.config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>
  ) {}

  async handleGitHubOAuth(profile: IGitHubProfile) {
    // TODO: Add OAuth-specific validations here (e.g., check if user is active, email verified, etc.)
    const user = await this.userService.findOrCreateFromGitHub(profile);

    if (!user) {
      throw new UnauthorizedException('Failed to validate GitHub user');
    }

    return user;
  }

  async login(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: envConfig.jwt.refreshSecret,
      expiresIn: envConfig.jwt.refreshExpiration,
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

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: envConfig.jwt.refreshSecret,
      });

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

      const user = await this.userService.findOne(payload.sub);
      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: envConfig.jwt.refreshSecret,
        expiresIn: envConfig.jwt.refreshExpiration,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
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
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    const expiresIn = envConfig.jwt.refreshExpiration;
    const expiryDate = new Date();
    if (expiresIn.endsWith('d')) {
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiresIn));
    } else if (expiresIn.endsWith('m')) {
      expiryDate.setMinutes(expiryDate.getMinutes() + parseInt(expiresIn));
    } else {
      expiryDate.setDate(expiryDate.getDate() + 7); // Default 7d
    }

    const session = new this.sessionModel({
      user: userId,
      refreshToken: hashedToken,
      expiresAt: expiryDate,
      userAgent,
      ipAddress,
    });

    await session.save();
  }
}
