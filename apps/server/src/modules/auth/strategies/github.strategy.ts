import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IGitHubProfile } from '@sos-academy/shared';
import { Strategy } from 'passport-github2';
import { AuthService } from '../auth.service';
import { envConfig } from 'apps/server/src/common/config/env.config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: envConfig.github.clientId,
      clientSecret: envConfig.github.clientSecret,
      callbackURL: envConfig.github.callbackUrl,
      scope: ['user:email', 'read:user'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const { id, username, displayName, emails, photos, profileUrl, _json } = profile;

      const githubProfile: IGitHubProfile = {
        login: username,
        githubId: parseInt(id),
        avatarUrl: photos?.[0]?.value,
        htmlUrl: profileUrl,
        email: emails?.[0]?.value,
        company: _json.company,
        blog: _json.blog,
        location: _json.location,
        bio: _json.bio,
        twitterUsername: _json.twitter_username,
        publicRepos: _json.public_repos,
        followers: _json.followers,
        following: _json.following,
        createdAt: new Date(_json.created_at),
        lastUpdated: new Date(_json.updated_at),
      };

      const user = await this.authService.handleGitHubOAuth(githubProfile);

      if (!user) {
        return done(new UnauthorizedException('Failed to validate GitHub user'), false);
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
}
