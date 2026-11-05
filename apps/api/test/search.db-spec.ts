/**
 * Runs search against local Supabase with its development seed.
 * Requires `npm run db:start`, `npm run db:reset` and an apps/api/.env. Run with `npm run test:db`.
 */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type { SearchResult, SearchSuggestion, SitemapEntry } from '@backendmasters/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('Search (local Supabase)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string) => request(app.getHttpServer()).get(`/api/v1${path}`);
  const search = async (query: string) => {
    const { body } = await get(`/search?${query}`).expect(200);
    return body as { data: SearchResult[]; meta: { pagination: { total: number } } };
  };
  const slugs = (results: { data: SearchResult[] }) => results.data.map(({ slug }) => slug);

  it('finds articles, problems and questions together', async () => {
    const results = await search('q=cache');
    const kinds = new Set(results.data.map(({ kind }) => kind));
    expect(kinds).toContain('article');
    expect(kinds).toContain('question');
    expect(results.meta.pagination.total).toBe(results.data.length);
  });

  it('finds DSA problems', async () => {
    expect(slugs(await search('q=substring'))).toContain(
      'longest-substring-without-repeating-characters',
    );
  });

  it('ranks title matches above a passing mention', async () => {
    const results = slugs(await search('q=stampede'));
    expect(results.slice(0, 2).sort()).toEqual([
      'cache-stampede-explained',
      'system-design-cache-stampede',
    ]);
  });

  it('matches word forms, not just exact text', async () => {
    expect(slugs(await search('q=balancers'))).toContain('how-load-balancers-distribute-traffic');
    expect(slugs(await search('q=balancing'))).toContain('how-load-balancers-distribute-traffic');
  });

  it('returns plain text descriptions', async () => {
    const results = await search('q=indices');
    const problem = results.data.find(({ slug }) => slug === 'two-sum');
    expect(problem?.description).not.toContain('`');
    expect(problem?.categorySlug).toBe('dsa');
  });

  it('filters by category', async () => {
    const results = await search('q=cache&category=interview-questions');
    expect(results.data.length).toBeGreaterThan(0);
    expect(results.data.every(({ kind }) => kind === 'question')).toBe(true);
  });

  it('filters by tag, which only articles have', async () => {
    const results = await search('q=retry+OR+load&tag=load-balancing');
    expect(slugs(results)).toEqual(['how-load-balancers-distribute-traffic']);
  });

  it('never returns drafts', async () => {
    expect(slugs(await search('q=golden+signals'))).not.toContain('draft-sre-golden-signals');
    expect((await search('q=backpressure')).data).toEqual([]);
    expect(slugs(await search('q=linked+list'))).not.toContain('draft-reverse-linked-list');
  });

  it('paginates with the full total', async () => {
    const first = await search('q=cache&pageSize=1');
    expect(first.data).toHaveLength(1);
    expect(first.meta.pagination.total).toBeGreaterThan(1);
    const second = await search('q=cache&pageSize=1&page=2');
    expect(second.data[0]?.slug).not.toBe(first.data[0]?.slug);
  });

  it('reports the total as zero past the last page', async () => {
    const results = await search('q=cache&page=99');
    expect(results.data).toEqual([]);
  });

  it.each(["' OR 1=1; --", '<script>alert(1)</script>', '"unclosed', '(((', 'a & | ! b', '\\'])(
    'treats %s as plain words',
    async (text) => {
      await search(`q=${encodeURIComponent(text)}`);
    },
  );

  it('rejects a missing or overlong query', async () => {
    await get('/search').expect(400);
    await get('/search?q=%20%20').expect(400);
    await get(`/search?q=${'x'.repeat(101)}`).expect(400);
  });

  describe('suggestions', () => {
    const suggest = async (q: string) => {
      const { body } = await get(`/search/suggestions?q=${encodeURIComponent(q)}`).expect(200);
      return body.data as SearchSuggestion[];
    };

    it('matches part of a title, with titles starting with it first', async () => {
      const titles = (await suggest('two')).map(({ title }) => title);
      expect(titles[0]).toBe('Two Sum');
    });

    it('never suggests drafts', async () => {
      expect((await suggest('draft')).map(({ slug }) => slug)).toEqual([]);
    });

    it('treats wildcards as plain text', async () => {
      expect(await suggest('%%')).toEqual([]);
      expect(await suggest('__')).toEqual([]);
    });

    it('needs at least two characters', async () => {
      await get('/search/suggestions?q=a').expect(400);
    });
  });

  it('lists only published content for the sitemap', async () => {
    const { body } = await get('/sitemap-entries').expect(200);
    const entries = body.data as SitemapEntry[];
    const paths = entries.map(({ kind, slug }) => `${kind}:${slug}`);
    expect(paths).toContain('article:rate-limiter-system-design');
    expect(paths).toContain('problem:two-sum');
    expect(paths).toContain('question:node-event-loop');
    expect(paths.some((path) => path.includes('draft'))).toBe(false);
  });
});
