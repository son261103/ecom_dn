import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums.js';
import { RolesGuard } from '../../guards/roles.guard.js';
import { AdminStatsService } from './admin-stats.service.js';

@UseGuards(new RolesGuard([Role.ADMIN]))
@Controller('admin/stats')
export class AdminStatsController {
  constructor(private readonly service: AdminStatsService) {}

  @Get()
  summary() {
    return this.service.summary();
  }
}