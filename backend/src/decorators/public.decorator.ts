import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opts a route out of the globally registered JwtAuthGuard.
 *
 * Auth is enabled by default across the whole app, so a new controller is
 * protected the moment it is created. Only endpoints that genuinely must be
 * reachable without a token carry this decorator:
 *
 *   @Public()
 *   @Get('products')
 *   findAll() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);