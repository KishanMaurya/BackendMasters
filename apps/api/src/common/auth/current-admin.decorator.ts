import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AdminContext, AdminRequest } from './admin.guard.js';

/** The administrator AdminGuard verified. Only valid on routes using that guard. */
export const CurrentAdmin = createParamDecorator(
  (_: unknown, context: ExecutionContext): AdminContext => {
    const { admin } = context.switchToHttp().getRequest<AdminRequest>();
    if (!admin) throw new Error('CurrentAdmin used on a route without AdminGuard');
    return admin;
  },
);
