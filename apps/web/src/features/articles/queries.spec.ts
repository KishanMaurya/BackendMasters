import { getArticleCounts, getArticlesByCategory, getFeaturedArticles } from './queries';

vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock('@/lib/env', () => ({ env: { API_URL: 'http://api.test/api/v1' } }));

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe('article queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns articles and asks for the right ones', async () => {
    const article = { slug: 'a' };
    const fetchMock = respond(200, { data: [article], meta: {} });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getArticlesByCategory('hld')).resolves.toEqual([article]);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://api.test/api/v1/articles?category=hld&pageSize=50',
    );
  });

  it('keeps "nothing published" distinct from "could not check"', async () => {
    vi.stubGlobal('fetch', respond(200, { data: [], meta: {} }));
    await expect(getFeaturedArticles()).resolves.toEqual([]);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    await expect(getFeaturedArticles()).resolves.toBeNull();

    vi.stubGlobal(
      'fetch',
      respond(502, { error: { code: 'BAD_GATEWAY', message: 'x' }, meta: {} }),
    );
    await expect(getFeaturedArticles()).resolves.toBeNull();
  });

  it('maps category counts by slug, and omits them on failure', async () => {
    vi.stubGlobal('fetch', respond(200, { data: [{ slug: 'dsa', articleCount: 3 }], meta: {} }));
    await expect(getArticleCounts()).resolves.toEqual({ dsa: 3 });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    await expect(getArticleCounts()).resolves.toEqual({});
  });
});
