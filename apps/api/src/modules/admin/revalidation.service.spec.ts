import type { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.js';
import { RevalidationService } from './revalidation.service.js';

function serviceWith(values: Partial<Env>) {
  const config = { get: (key: keyof Env) => values[key] };
  return new RevalidationService(config as unknown as ConfigService<Env, true>);
}

const CONFIGURED = { WEB_REVALIDATE_URL: 'https://site/api/revalidate', REVALIDATE_SECRET: 's' };

describe('RevalidationService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends the secret in a header and reports success', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response('{}')));
    vi.stubGlobal('fetch', fetchMock);

    await expect(serviceWith(CONFIGURED).revalidateContent()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      CONFIGURED.WEB_REVALIDATE_URL,
      expect.objectContaining({ method: 'POST', headers: { 'x-revalidate-secret': 's' } }),
    );
  });

  it('reports false, without throwing, when the site refuses or is down', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve(new Response('{}', { status: 401 })));
    await expect(serviceWith(CONFIGURED).revalidateContent()).resolves.toBe(false);

    vi.stubGlobal('fetch', () => Promise.reject(new Error('down')));
    await expect(serviceWith(CONFIGURED).revalidateContent()).resolves.toBe(false);
  });

  it('reports false when not configured, without calling anything', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(serviceWith({}).revalidateContent()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
