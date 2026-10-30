import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ICurrentUser } from '@sos-academy/shared';
import { CookieOptions, Response } from 'express';
import { envConfig } from '../../common/config/env.config';
import { AuthService, refreshExpiryDate } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_COOKIE = 'refresh_token';

const refreshCookieOptions = ({ clear = false } = {}): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  // Same lifetime as the session it belongs to
  ...(!clear && { expires: refreshExpiryDate() }),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  @UseGuards(GithubAuthGuard)
  async githubLogin() {
    // Initiates the GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubLoginCallback(@Req() req, @Res() res: Response) {
    const user = req.user;

    const { accessToken, refreshToken } = await this.authService.login(user);

    // Set Refresh Token in HTTP-Only Cookie
    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());

    const frontendUrl = envConfig.frontends.hackerPortalUrl;

    const userParam = encodeURIComponent(
      JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.githubProfile?.avatarUrl,
        githubHandle: user.githubProfile?.login,
      })
    );

    res.redirect(`${frontendUrl}/auth/callback?access_token=${accessToken}&user=${userParam}`);
  }

  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(refreshToken);

    res.cookie(REFRESH_COOKIE, newRefreshToken, refreshCookieOptions());

    return { accessToken, refreshToken: newRefreshToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: ICurrentUser, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user._id);

    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions({ clear: true }));
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: ICurrentUser) {
    return user;
  }
}
