import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '../generated/prisma/enums.js';
import type { RequestUser } from '../auth/types.js';

/**
 * Narrows an already-authenticated route to specific roles. The global
 * JwtAuthGuard runs first and populates `request.user`.
 *
 *   @UseGuards(new RolesGuard([Role.ADMIN]))
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowedRoles: Role[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();

    if (!request.user) {
      throw new UnauthorizedException();
    }

    if (!this.allowedRoles.includes(request.user.role)) {
      throw new ForbiddenException(
        'Chỉ quản trị viên mới được thực hiện',
      );
    }

    return true;
  }
}