import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import {
  PRODUCT_IMAGE_ALLOWED_MIME_TYPES,
  PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES,
} from './uploads.constants';

type ProductImageUploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');

    if (cloudinaryUrl) {
      cloudinary.config();
      return;
    }

    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadProductImage(
    file?: Express.Multer.File,
  ): Promise<ProductImageUploadResult> {
    this.validateProductImage(file);

    const folder = this.configService.get<string>(
      'CLOUDINARY_FOLDER',
      'kng-fashion/products',
    );

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
          },
          (error, uploadResult) => {
            if (error) {
              reject(this.toError(error));
              return;
            }

            if (!uploadResult) {
              reject(new Error('Cloudinary upload did not return a result.'));
              return;
            }

            resolve(uploadResult);
          },
        );

        uploadStream.end(file!.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch {
      throw new InternalServerErrorException('Image upload failed.');
    }
  }

  private toError(error: unknown) {
    if (error instanceof Error) {
      return error;
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return new Error((error as { message: string }).message);
    }

    return new Error('Cloudinary upload failed.');
  }

  private validateProductImage(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Product image file is required.');
    }

    if (!file.buffer?.length) {
      throw new BadRequestException('Product image file is invalid.');
    }

    if (file.size > PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Product image must be 5MB or smaller.');
    }

    if (
      !(PRODUCT_IMAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WEBP images are allowed.',
      );
    }
  }
}
