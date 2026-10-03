import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user.decorator.js';
import type { RequestUser } from '../../auth/types.js';
import { Role } from '../../generated/prisma/enums.js';
import { RolesGuard } from '../../guards/roles.guard.js';
import { AdminUsersService } from './admin-users.service.js';
import {
  AdminUserListQueryDto,
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto/admin-user.dto.js';

@UseGuards(new RolesGuard([Role.ADMIN]))
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  findAll(@Query() query: AdminUserListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.service.update(id, dto, actor);
  }

  @Patch(':id/password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() actor: RequestUser) {
    return this.service.remove(id, actor);
  }
}