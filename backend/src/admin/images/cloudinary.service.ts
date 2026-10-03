import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';

export interface UploadedImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const FOLDER = 'ecom_dn';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  /** True once all three credentials are present, so the app still boots without them. */
  get isConfigured() {
    return Boolean(
      this.config.get<string>('CLOUDINARY_CLOUD_NAME') &&
        this.config.get<string>('CLOUDINARY_API_KEY') &&
        this.config.get<string>('CLOUDINARY_API_SECRET'),
    );
  }

  private assertConfigured() {
    if (!this.isConfigured) {
      throw new BadRequestException(
        'Cloudinary chưa được cấu hình. Điền CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong backend/.env',
      );
    }
  }

  private toImage(result: UploadApiResponse): UploadedImage {
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  /** Upload from a disk/memory buffer, e.g. a multipart file. */
  async uploadBuffer(
    buffer: Buffer,
    options: { folder?: string; publicId?: string } = {},
  ): Promise<UploadedImage> {
    this.assertConfigured();

    const stream = Readable.from(buffer);
    const result = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: options.folder ?? FOLDER,
            resource_type: 'image',
            ...(options.publicId && { public_id: options.publicId }),
          },
          (error, res) => {
            if (error) reject(error);
            else resolve(res as UploadApiResponse);
          },
        );
        stream.pipe(upload);
      },
    );

    return this.toImage(result);
  }

  /** Upload straight from a remote URL, so the seed can push existing images. */
  async uploadRemote(
    url: string,
    options: { folder?: string; publicId?: string } = {},
  ): Promise<UploadedImage> {
    this.assertConfigured();

    const result = await cloudinary.uploader.upload(url, {
      folder: options.folder ?? FOLDER,
      resource_type: 'image',
      ...(options.publicId && { public_id: options.publicId }),
    });

    return this.toImage(result);
  }

  async delete(publicId: string) {
    this.assertConfigured();
    return cloudinary.uploader.destroy(publicId);
  }
}