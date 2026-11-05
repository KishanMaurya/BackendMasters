import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { SupabaseService } from '../../supabase/supabase.service.js';
import { AdminGuard, type AdminRequest } from './admin.guard.js';

function setup(verified: string | null, isAdmin: boolean | Error = true) {
  const rpc = vi.fn(() =>
    Promise.resolve(
      isAdmin instanceof Error
        ? { data: null, error: { message: isAdmin.message } }
        : { data: isAdmin, error: null },
    ),
  );
  const supabase = {
    verifyAccessToken: vi.fn(() => Promise.resolve(verified)),
    clientForUser: vi.fn(() => ({ rpc })),
  };
  return { guard: new AdminGuard(supabase as unknown as SupabaseService), supabase };
}

function contextFor(authorization?: string) {
  const request = { headers: { authorization } } as unknown as AdminRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { request, context };
}

describe('AdminGuard', () => {
  it.each([undefined, '', 'token', 'Basic abc', 'Bearer ', 'Bearer a b'])(
    'refuses the header %j without checking a token',
    async (header) => {
      const { guard, supabase } = setup('user');
      await expect(guard.canActivate(contextFor(header).context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(supabase.verifyAccessToken).not.toHaveBeenCalled();
    },
  );

  it('refuses a token that fails verification', async () => {
    const { guard, supabase } = setup(null);
    await expect(guard.canActivate(contextFor('Bearer bad').context)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(supabase.clientForUser).not.toHaveBeenCalled();
  });

  it('refuses a valid user who is not an administrator', async () => {
    const { guard } = setup('user', false);
    await expect(guard.canActivate(contextFor('Bearer good').context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('fails closed when the role check errors', async () => {
    const { guard } = setup('user', new Error('database down'));
    const { request, context } = contextFor('Bearer good');
    await expect(guard.canActivate(context)).rejects.toThrow();
    expect(request.admin).toBeUndefined();
  });

  it('checks the role as the user and records the administrator', async () => {
    const { guard, supabase } = setup('user-id');
    const { request, context } = contextFor('Bearer good');
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(supabase.clientForUser).toHaveBeenCalledWith('good');
    expect(request.admin).toEqual({ id: 'user-id', accessToken: 'good' });
  });
});
