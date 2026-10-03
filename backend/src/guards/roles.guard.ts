import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '../generated/prisma/enums.js';
import type { RequestUser } from '../auth/types.js';

/**
 * Restricts a route to users holding one of `allowedRoles`. Apply after
 * JwtAuthGuard so `request.user` is already populated.
 *
 *   @UseGuards(JwtAuthGuard, new RolesGuard([Role.ADMIN]))
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: Role[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();

    if (!request.user || !this.allowedRoles.includes(request.user.role)) {
      throw new ForbiddenException(
        'Chỉ quản trị viên mới được thực hiện',
      );
    }

    return true;
  }
}