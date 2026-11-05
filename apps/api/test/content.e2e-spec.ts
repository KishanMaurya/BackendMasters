// See app.e2e-spec.ts: this has to run before imports load the environment.
vi.hoisted(() => {
  for (const key of ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY']) {
    process.env[key] = '';
  }
});

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { databaseFailure } from '../src/common/http/database-error.js';
import { ArticlesRepository } from '../src/modules/articles/articles.repository.js';
import { CategoriesRepository } from '../src/modules/categories/categories.repository.js';

describe('Content API (no database)', () => {
  let app: INestApplication<App>;
  const articles = { findPublished: vi.fn(), findBySlug: vi.fn(), findAllSlugs: vi.fn() };
  const categories = { findAll: vi.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ArticlesRepository)
      .useValue(articles)
      .overrideProvider(CategoriesRepository)
      .useValue(categories)
      .compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.resetAllMocks();
    articles.findPublished.mockResolvedValue({ items: [{ slug: 'a' }], total: 25 });
  });

  const get = (path: string) => request(app.getHttpServer()).get(`/api/v1${path}`);

  it('puts pagination in meta and applies defaults', async () => {
    const { body } = await get('/articles').expect(200);

    expect(body.data).toEqual([{ slug: 'a' }]);
    expect(body.meta.pagination).toEqual({ page: 1, pageSize: 12, total: 25 });
    expect(articles.findPublished).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 12 }),
    );
  });

  it('converts query strings to typed values', async () => {
    await get(
      '/articles?page=2&pageSize=5&featured=false&difficulty=hard&category=aws&tag=s3',
    ).expect(200);
    expect(articles.findPublished).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 5,
        featured: false,
        difficulty: 'hard',
        category: 'aws',
        tag: 's3',
      }),
    );
  });

  it.each([
    'page=0',
    'page=abc',
    'pageSize=51',
    'category=nope',
    'difficulty=impossible',
    'featured=maybe',
    'tag=Bad%20Tag',
    'unknown=1',
  ])('rejects %s', async (query) => {
    const { body } = await get(`/articles?${query}`).expect(400);
    expect(body.error.message).toBe('Validation failed');
    expect(articles.findPublished).not.toHaveBeenCalled();
  });

  it('routes /articles/slugs to the slug list rather than to an article', async () => {
    articles.findAllSlugs.mockResolvedValue(['a', 'b']);
    const { body } = await get('/articles/slugs').expect(200);
    expect(body.data).toEqual(['a', 'b']);
    expect(articles.findBySlug).not.toHaveBeenCalled();
  });

  it('returns 404 when no published article has the slug', async () => {
    articles.findBySlug.mockResolvedValue(null);
    const { body } = await get('/articles/missing').expect(404);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('rejects a malformed slug before reaching the database', async () => {
    await get('/articles/Not_A_Slug').expect(400);
    expect(articles.findBySlug).not.toHaveBeenCalled();
  });

  it('hides database details when a query fails', async () => {
    categories.findAll.mockRejectedValue(
      databaseFailure('Test', { code: 'XX000', message: 'secret table detail' }),
    );
    const { body, text } = await get('/categories').expect(502);
    expect(body.error.code).toBe('BAD_GATEWAY');
    expect(text).not.toContain('secret table detail');
  });

  it('documents the new routes in Swagger', async () => {
    const { body } = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
    for (const path of [
      '/api/v1/articles',
      '/api/v1/articles/{slug}',
      '/api/v1/articles/{slug}/related',
      '/api/v1/articles/slugs',
      '/api/v1/categories',
      '/api/v1/tags',
    ]) {
      expect(body.paths[path]).toBeDefined();
    }
  });
});
