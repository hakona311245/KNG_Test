import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES } from './uploads.constants';
import { UploadsService } from './uploads.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

function createConfigService(overrides: Record<string, string | undefined> = {}) {
  const values: Record<string, string | undefined> = {
    CLOUDINARY_CLOUD_NAME: 'demo-cloud',
    CLOUDINARY_API_KEY: 'demo-key',
    CLOUDINARY_API_SECRET: 'demo-secret',
    ...overrides,
  };

  return {
    getOrThrow: jest.fn((key: string) => {
      return values[key];
    }),
    get: jest.fn((key: string, defaultValue?: string) => values[key] ?? defaultValue),
  };
}

function createFile(overrides: Partial<Express.Multer.File> = {}) {
  return {
    fieldname: 'file',
    originalname: 'product.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('image'),
    ...overrides,
  } as Express.Multer.File;
}

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UploadsService(createConfigService() as never);
  });

  it('configures Cloudinary from environment values', () => {
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'demo-cloud',
      api_key: 'demo-key',
      api_secret: 'demo-secret',
    });
  });

  it('allows Cloudinary to read CLOUDINARY_URL when configured', () => {
    jest.clearAllMocks();

    service = new UploadsService(
      createConfigService({
        CLOUDINARY_URL: 'cloudinary://demo-key:demo-secret@demo-cloud',
      }) as never,
    );

    expect(service).toBeDefined();
    expect(cloudinary.config).toHaveBeenCalledWith();
  });

  it('rejects missing image file', async () => {
    await expect(service.uploadProductImage()).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects invalid image MIME type', async () => {
    await expect(
      service.uploadProductImage(createFile({ mimetype: 'text/plain' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects oversized image files', async () => {
    await expect(
      service.uploadProductImage(
        createFile({ size: PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES + 1 }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('uploads valid product image and returns Cloudinary metadata', async () => {
    const end = jest.fn();
    jest
      .mocked(cloudinary.uploader.upload_stream)
      .mockImplementation((_options, callback) => {
        callback(undefined, {
          secure_url: 'https://res.cloudinary.com/demo/product.jpg',
          public_id: 'kng-fashion/products/product',
          width: 1200,
          height: 1600,
          format: 'jpg',
          bytes: 123456,
        } as never);

        return { end } as never;
      });

    await expect(service.uploadProductImage(createFile())).resolves.toEqual({
      url: 'https://res.cloudinary.com/demo/product.jpg',
      publicId: 'kng-fashion/products/product',
      width: 1200,
      height: 1600,
      format: 'jpg',
      bytes: 123456,
    });
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      {
        folder: 'kng-fashion/products',
        resource_type: 'image',
      },
      expect.any(Function),
    );
    expect(end).toHaveBeenCalledWith(Buffer.from('image'));
  });

  it('returns server error when Cloudinary upload fails', async () => {
    jest
      .mocked(cloudinary.uploader.upload_stream)
      .mockImplementation((_options, callback) => {
        callback(new Error('Cloudinary failed'), undefined);

        return { end: jest.fn() } as never;
      });

    await expect(service.uploadProductImage(createFile())).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
