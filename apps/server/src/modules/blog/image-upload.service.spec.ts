import { ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { envConfig } from '../../common/config/env.config';
import { ImageUploadService } from './image-upload.service';

jest.mock('cloudinary', () => ({
  v2: { config: jest.fn(), uploader: { upload_stream: jest.fn() } },
}));

const uploadStream = cloudinary.uploader.upload_stream as unknown as jest.Mock;

describe('ImageUploadService', () => {
  const service = new ImageUploadService();
  const file = {
    buffer: Buffer.from('png'),
    mimetype: 'image/png',
    originalname: 'a.png',
    size: 3,
  };
  const original = { ...envConfig.cloudinary };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(envConfig.cloudinary, {
      cloudName: 'demo',
      apiKey: 'key',
      apiSecret: 'secret',
      folder: 'sos-academy/blog',
    });
  });
  afterAll(() => Object.assign(envConfig.cloudinary, original));

  it('uploads to the configured folder and returns the secure URL', async () => {
    const end = jest.fn();
    uploadStream.mockImplementation((_options, callback) => {
      end.mockImplementation(() =>
        callback(undefined, {
          secure_url: 'https://res.cloudinary.com/demo/a.png',
          width: 640,
          height: 480,
          public_id: 'a',
        })
      );
      return { end };
    });

    await expect(service.upload(file)).resolves.toEqual({
      url: 'https://res.cloudinary.com/demo/a.png',
      width: 640,
      height: 480,
    });
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'demo',
      api_key: 'key',
      api_secret: 'secret',
      secure: true,
    });
    expect(uploadStream.mock.calls[0][0]).toEqual({
      folder: 'sos-academy/blog',
      resource_type: 'image',
    });
    expect(end).toHaveBeenCalledWith(file.buffer);
  });

  it('refuses to upload when Cloudinary is not configured', async () => {
    envConfig.cloudinary.apiSecret = '';

    expect(service.isConfigured).toBe(false);
    await expect(service.upload(file)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(uploadStream).not.toHaveBeenCalled();
  });

  it('turns a Cloudinary error into a 503', async () => {
    uploadStream.mockImplementation((_options, callback) => ({
      end: () => callback({ message: 'Invalid signature', http_code: 401 }),
    }));

    await expect(service.upload(file)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
