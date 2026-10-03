import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '../../generated/prisma/enums.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
import { RolesGuard } from '../../guards/roles.guard.js';
import { CloudinaryService } from './cloudinary.service.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

/**
 * Admin-only image management. Lives under /api/admin/upload and is guarded by
 * JwtAuthGuard + RolesGuard([ADMIN]), so every route requires an admin token.
 */
@UseGuards(JwtAuthGuard, new RolesGuard([Role.ADMIN]))
@Controller('admin/upload')
export class AdminImageUploadController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Get('status')
  status() {
    return { configured: this.cloudinary.isConfigured };
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              `Chỉ chấp nhận ${ALLOWED_MIME_TYPES.join(', ')}`,
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Chưa có file nào được tải lên');

    return this.cloudinary.uploadBuffer(file.buffer, {
      folder: 'ecom_dn/products',
    });
  }

  @Post('image-from-url')
  uploadFromUrl(@Body() body: { url?: string }) {
    if (!body.url) throw new BadRequestException('Thiếu url ảnh');
    return this.cloudinary.uploadRemote(body.url, {
      folder: 'ecom_dn/products',
    });
  }

  @Delete(':publicId')
  remove(@Param('publicId') publicId: string) {
    return this.cloudinary.delete(publicId);
  }
}