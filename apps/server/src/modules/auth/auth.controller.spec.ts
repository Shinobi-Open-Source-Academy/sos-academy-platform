import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/** HTTP-level test of /auth/refresh, with cookie-parser registered like in main.ts */
describe('AuthController (HTTP)', () => {
  let app: INestApplication;
  let baseUrl: string;
  const authService = { refreshTokens: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();
    app = module.createNestApplication();
    app.use(cookieParser());
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', 'localhost');
  });

  afterAll(() => app.close());
  beforeEach(() => authService.refreshTokens.mockReset());

  it('returns 401 (not 500) when the refresh cookie is missing', async () => {
    const res = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST' });

    expect(res.status).toBe(401);
    expect(authService.refreshTokens).not.toHaveBeenCalled();
  });

  it('reads the refresh cookie and sets the rotated one', async () => {
    authService.refreshTokens.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: 'refresh_token=old-refresh' },
    });

    expect(res.status).toBe(201);
    expect(authService.refreshTokens).toHaveBeenCalledWith('old-refresh');
    await expect(res.json()).resolves.toMatchObject({ accessToken: 'new-access' });
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('refresh_token=new-refresh');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toMatch(/Expires=/);
  });

  it('returns 401 when the refresh token is rejected', async () => {
    authService.refreshTokens.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

    const res = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: 'refresh_token=stale' },
    });

    expect(res.status).toBe(401);
  });
});
