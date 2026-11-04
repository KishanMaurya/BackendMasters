/**
 * Runs the real API against local Supabase with its development seed.
 * Requires `npm run db:start`, `npm run db:reset` and an apps/api/.env. Run with `npm run test:db`.
 */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { CATEGORY_SLUGS, type ArticleSummary, type CategorySummary } from '@backendmasters/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

const DRAFT = 'draft-sre-golden-signals';

describe('Content API (local Supabase)', () => {
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
  const slugs = (body: { data: ArticleSummary[] }) => body.data.map((article) => article.slug);

  it('reports Supabase as healthy', async () => {
    const { body } = await get('/health').expect(200);
    expect(body.data.dependencies.supabase).toBe('ok');
  });

  it('lists published articles newest first and hides drafts', async () => {
    const { body } = await get('/articles').expect(200);
    expect(slugs(body)).toEqual([
      'sliding-window-pattern',
      'cache-stampede-explained',
      'how-load-balancers-distribute-traffic',
    ]);
    expect(body.meta.pagination.total).toBe(3);
    expect(body.data[0]).toMatchObject({ categorySlug: 'dsa', categoryName: 'DSA & Algorithms' });
  });

  it('returns 404 for a draft requested by slug', async () => {
    await get(`/articles/${DRAFT}`).expect(404);
  });

  it('returns full detail for a published article', async () => {
    const { body } = await get('/articles/cache-stampede-explained').expect(200);
    expect(body.data.content).toContain('## The problem');
    expect(body.data.tags.map((tag: { slug: string }) => tag.slug)).toEqual([
      'caching',
      'reliability',
    ]);
    expect(body.data.author).toBeNull();
  });

  it('filters by category, tag, difficulty and featured', async () => {
    expect(slugs((await get('/articles?category=hld').expect(200)).body)).toEqual([
      'how-load-balancers-distribute-traffic',
    ]);
    const byTag = (await get('/articles?tag=reliability').expect(200)).body;
    expect(slugs(byTag)).toEqual([
      'cache-stampede-explained',
      'how-load-balancers-distribute-traffic',
    ]);
    expect(byTag.meta.pagination.total).toBe(2);
    expect(slugs((await get('/articles?difficulty=medium').expect(200)).body)).toEqual([
      'cache-stampede-explained',
    ]);
    expect(slugs((await get('/articles?featured=false').expect(200)).body)).toEqual([
      'sliding-window-pattern',
    ]);
    expect((await get('/articles?category=observability').expect(200)).body.data).toEqual([]);
  });

  it('paginates, including past the last page', async () => {
    const second = (await get('/articles?page=2&pageSize=1').expect(200)).body;
    expect(slugs(second)).toEqual(['cache-stampede-explained']);
    expect(second.meta.pagination).toEqual({ page: 2, pageSize: 1, total: 3 });

    const beyond = (await get('/articles?page=9').expect(200)).body;
    expect(beyond.data).toEqual([]);
    expect(beyond.meta.pagination.total).toBe(3);
  });

  it('keeps database categories in sync with the shared slugs, and excludes drafts from counts', async () => {
    const { body } = await get('/categories').expect(200);
    const categories = body.data as CategorySummary[];
    expect(categories.map((category) => category.slug)).toEqual([...CATEGORY_SLUGS]);
    expect(categories.find((c) => c.slug === 'hld')?.articleCount).toBe(1);
    expect(categories.find((c) => c.slug === 'observability')?.articleCount).toBe(0);
  });

  it('lists tags', async () => {
    const { body } = await get('/tags').expect(200);
    expect(body.data.map((tag: { slug: string }) => tag.slug)).toContain('caching');
  });
});
