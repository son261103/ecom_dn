import { Module } from '@nestjs/common';
import { AdminImageUploadController } from './images/image-upload.controller.js';
import { CloudinaryService } from './images/cloudinary.service.js';

/**
 * Everything an administrator can do that customers cannot. Grouped under
 * /api/admin/* so the public surface is obvious from the routes alone.
 */
@Module({
  controllers: [AdminImageUploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class AdminModule {}