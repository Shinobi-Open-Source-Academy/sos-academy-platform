import { INestApplication, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { ImageUploadService } from './image-upload.service';

/** HTTP-level tests of POST /blog/images (multipart upload, admin only) */
describe('POST /blog/images', () => {
  let app: INestApplication;
  let baseUrl: string;
  let loggedIn = true;
  const imageUploadService = { upload: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        { provide: BlogService, useValue: {} },
        { provide: ImageUploadService, useValue: imageUploadService },
      ],
    }).compile();
    app = module.createNestApplication();
    // Stand-in for express-session: AdminSessionGuard reads req.session.adminId
    app.use((req: { session?: object }, _res: unknown, next: () => void) => {
      req.session = loggedIn ? { adminId: 'admin-1' } : {};
      next();
    });
    await app.listen(0);
    baseUrl = (await app.getUrl()).replace('[::1]', 'localhost');
  });

  afterAll(() => app.close());
  beforeEach(() => {
    loggedIn = true;
    imageUploadService.upload.mockReset();
  });

  const upload = (type: string, size = 1024, field = 'image') => {
    const form = new FormData();
    form.append(field, new Blob([new Uint8Array(size)], { type }), 'photo.png');
    return fetch(`${baseUrl}/blog/images`, { method: 'POST', body: form });
  };

  it('uploads an image and returns its URL', async () => {
    imageUploadService.upload.mockResolvedValue({
      url: 'https://res.cloudinary.com/x/a.png',
      width: 10,
      height: 10,
    });

    const res = await upload('image/png');

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({
      url: 'https://res.cloudinary.com/x/a.png',
      width: 10,
      height: 10,
    });
    const [file] = imageUploadService.upload.mock.calls[0];
    expect(file).toMatchObject({ mimetype: 'image/png', originalname: 'photo.png', size: 1024 });
    expect(Buffer.isBuffer(file.buffer)).toBe(true);
  });

  it('requires an admin session', async () => {
    loggedIn = false;

    const res = await upload('image/png');

    expect(res.status).toBe(401);
    expect(imageUploadService.upload).not.toHaveBeenCalled();
  });

  it.each(['image/svg+xml', 'text/html', 'application/pdf'])('rejects %s files', async (type) => {
    const res = await upload(type);

    expect(res.status).toBe(400);
    expect(imageUploadService.upload).not.toHaveBeenCalled();
  });

  it('rejects images larger than 5 MB', async () => {
    const res = await upload('image/jpeg', 5 * 1024 * 1024 + 1);

    expect(res.status).toBe(413);
    expect(imageUploadService.upload).not.toHaveBeenCalled();
  });

  it('rejects a request without an "image" field', async () => {
    const res = await upload('image/png', 10, 'file');

    expect(res.status).toBe(400);
  });

  it('reports a missing Cloudinary configuration as 503', async () => {
    imageUploadService.upload.mockRejectedValue(new ServiceUnavailableException('not configured'));

    const res = await upload('image/png');

    expect(res.status).toBe(503);
  });
});
