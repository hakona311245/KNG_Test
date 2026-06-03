import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  PRODUCT_IMAGE_ALLOWED_MIME_TYPES,
  PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES,
} from './uploads.constants';
import { UploadsService } from './uploads.service';

@ApiTags('Admin Uploads')
@ApiCookieAuth('access_token')
@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('product-images')
  @ApiOperation({ summary: 'Upload product image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: PRODUCT_IMAGE_MAX_FILE_SIZE_BYTES,
      },
      fileFilter: (_request, file, callback) => {
        if (
          !(PRODUCT_IMAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(
            file.mimetype,
          )
        ) {
          callback(
            new BadRequestException(
              'Only JPEG, PNG, and WEBP images are allowed.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadProductImage(@UploadedFile() file?: Express.Multer.File) {
    const data = await this.uploadsService.uploadProductImage(file);

    return {
      data,
      message: 'Image uploaded successfully',
    };
  }
}
