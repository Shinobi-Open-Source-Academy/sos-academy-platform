import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { envConfig } from '../../common/config/env.config';

/** Image file as received by Multer's memory storage */
export interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface UploadedImageResult {
  url: string;
  width: number;
  height: number;
}

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Uploads blog images to Cloudinary (public delivery URLs).
 */
@Injectable()
export class ImageUploadService {
  private readonly logger = new Logger(ImageUploadService.name);

  get isConfigured(): boolean {
    const { cloudName, apiKey, apiSecret } = envConfig.cloudinary;
    return Boolean(cloudName && apiKey && apiSecret);
  }

  async upload(file: UploadedImage): Promise<UploadedImageResult> {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        'Image uploads are not configured on the server (missing CLOUDINARY_* variables)'
      );
    }

    const { cloudName, apiKey, apiSecret, folder } = envConfig.cloudinary;
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder, resource_type: 'image' }, (error, response) =>
            error || !response
              ? reject(error ?? new Error('Empty Cloudinary response'))
              : resolve(response)
          )
          .end(file.buffer);
      });

      this.logger.log(`Uploaded blog image ${file.originalname} → ${result.public_id}`);
      return { url: result.secure_url, width: result.width, height: result.height };
    } catch (error) {
      this.logger.error(
        `Cloudinary upload failed for ${file.originalname}: ${error instanceof Error ? error.message : JSON.stringify(error)}`
      );
      throw new ServiceUnavailableException('The image could not be uploaded, please try again');
    }
  }
}
