import { Module } from '@nestjs/common';
import { Role } from '../generated/prisma/enums.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { AdminCategoriesController } from './categories/admin-categories.controller.js';
import { AdminCategoriesService } from './categories/admin-categories.service.js';
import { AdminImageUploadController } from './images/image-upload.controller.js';
import { CloudinaryService } from './images/cloudinary.service.js';
import { AdminOrdersController } from './orders/admin-orders.controller.js';
import { AdminOrdersService } from './orders/admin-orders.service.js';
import { AdminProductsController } from './products/admin-products.controller.js';
import { AdminProductsService } from './products/admin-products.service.js';
import { AdminStatsController } from './stats/admin-stats.controller.js';
import { AdminStatsService } from './stats/admin-stats.service.js';
import { AdminUsersController } from './users/admin-users.controller.js';
import { AdminUsersService } from './users/admin-users.service.js';

/**
 * Everything an administrator can do that customers cannot, grouped under
 * /api/admin/*. Authentication is global; each controller narrows further
 * with RolesGuard([Role.ADMIN]).
 */
@Module({
  controllers: [
    AdminStatsController,
    AdminCategoriesController,
    AdminProductsController,
    AdminOrdersController,
    AdminUsersController,
    AdminImageUploadController,
  ],
  providers: [
    AdminStatsService,
    AdminCategoriesService,
    AdminProductsService,
    AdminOrdersService,
    AdminUsersService,
    CloudinaryService,
  ],
  exports: [CloudinaryService],
})
export class AdminModule {}