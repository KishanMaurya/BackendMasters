import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { databaseFailure } from '../http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';

export interface AdminContext {
  id: string;
  /** Forwarded to Supabase, so Row Level Security checks every query a second time. */
  accessToken: string;
}

export interface AdminRequest extends Request {
  admin?: AdminContext;
}

const BEARER = /^Bearer (\S+)$/;

/** Allows signed-in administrators only. RLS enforces the same rule in the database. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const accessToken = BEARER.exec(request.headers.authorization ?? '')?.[1];
    if (!accessToken) throw new UnauthorizedException('Sign in to continue');

    const id = await this.supabase.verifyAccessToken(accessToken);
    if (!id) throw new UnauthorizedException('Sign in to continue');

    const { data: isAdmin, error } = await this.supabase.clientForUser(accessToken).rpc('is_admin');
    if (error) throw databaseFailure('Checking administrator access', error);
    if (!isAdmin) throw new ForbiddenException('Administrator access is required');

    request.admin = { id, accessToken };
    return true;
  }
}
