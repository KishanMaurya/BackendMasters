import { ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { SupabaseService } from './supabase.service.js';

function serviceWith(values: Partial<Env>): SupabaseService {
  const config = { get: (key: keyof Env) => values[key] } as unknown as ConfigService<Env, true>;
  return new SupabaseService(config);
}

const CONFIGURED = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'publishable',
  SUPABASE_SECRET_KEY: 'secret',
};

describe('SupabaseService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports not_configured without making a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(serviceWith({}).checkHealth()).resolves.toBe('not_configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses to build clients when unconfigured', () => {
    const service = serviceWith({});
    expect(() => service.publicClient).toThrow(ServiceUnavailableException);
    expect(() => service.adminClient).toThrow(ServiceUnavailableException);
    expect(() => service.clientForUser('token')).toThrow(ServiceUnavailableException);
  });

  it('builds clients and reuses the shared ones when configured', () => {
    const service = serviceWith(CONFIGURED);
    expect(service.publicClient).toBe(service.publicClient);
    expect(service.adminClient).not.toBe(service.publicClient);
    expect(service.clientForUser('a')).not.toBe(service.clientForUser('a'));
  });

  it('reports ok when the Supabase auth endpoint responds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    await expect(serviceWith(CONFIGURED).checkHealth()).resolves.toBe('ok');
  });

  it.each([
    ['an error status', () => vi.fn().mockResolvedValue({ ok: false })],
    ['a network failure', () => vi.fn().mockRejectedValue(new Error('down'))],
  ])('reports unreachable on %s', async (_name, makeFetch) => {
    vi.stubGlobal('fetch', makeFetch());
    await expect(serviceWith(CONFIGURED).checkHealth()).resolves.toBe('unreachable');
  });
});
