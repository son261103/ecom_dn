import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/enums.js';
import type { Request } from 'express';
import type { RequestUser } from '../types.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();

    if (request.user?.role !== Role.ADMIN) {
      throw new ForbiddenException('Chỉ quản trị viên mới được thực hiện');
    }

    return true;
  }
}