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
import { AdminArticlesRepository } from '../src/modules/admin/admin-articles.repository.js';
import { SupabaseService } from '../src/supabase/supabase.service.js';

const ID = '11111111-1111-4111-8111-111111111111';
const CATEGORY = '22222222-2222-4222-8222-222222222222';
const ROUTES: ['get' | 'post' | 'put' | 'patch' | 'delete', string][] = [
  ['get', '/admin/me'],
  ['get', '/admin/stats'],
  ['get', '/admin/articles'],
  ['get', `/admin/articles/${ID}`],
  ['post', '/admin/articles'],
  ['put', `/admin/articles/${ID}`],
  ['delete', `/admin/articles/${ID}`],
  ['post', `/admin/articles/${ID}/publish`],
  ['post', `/admin/articles/${ID}/unpublish`],
  ['get', '/admin/categories'],
  ['patch', `/admin/categories/${ID}`],
  ['get', '/admin/tags'],
  ['post', '/admin/tags'],
  ['patch', `/admin/tags/${ID}`],
  ['delete', `/admin/tags/${ID}`],
  ['post', '/admin/media/images'],
];

const VALID_ARTICLE = {
  slug: 'a-title',
  title: 'A title',
  description: '',
  content: '',
  coverImageUrl: null,
  categoryId: CATEGORY,
  difficulty: null,
  seoTitle: null,
  seoDescription: null,
  isFeatured: false,
  tagIds: [],
};

describe('Admin API (no database)', () => {
  let app: INestApplication<App>;
  const rpc = vi.fn();
  const supabase = {
    isConfigured: true,
    verifyAccessToken: vi.fn(),
    clientForUser: vi.fn(() => ({ rpc })),
    checkHealth: vi.fn(),
  };
  const articles = { save: vi.fn(), findById: vi.fn(), list: vi.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SupabaseService)
      .useValue(supabase)
      .overrideProvider(AdminArticlesRepository)
      .useValue(articles)
      .compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabase.verifyAccessToken.mockResolvedValue('user');
    rpc.mockResolvedValue({ data: true, error: null });
  });

  const call = (method: (typeof ROUTES)[number][0], path: string) =>
    request(app.getHttpServer())[method](`/api/v1${path}`);
  const asAdmin = (method: (typeof ROUTES)[number][0], path: string) =>
    call(method, path).set('Authorization', 'Bearer token');

  it.each(ROUTES)('%s %s refuses anonymous callers', async (method, path) => {
    const { body } = await call(method, path).expect(401);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it.each(ROUTES)('%s %s refuses signed-in non-admins', async (method, path) => {
    rpc.mockResolvedValue({ data: false, error: null });
    await asAdmin(method, path).expect(403);
  });

  it('refuses an invalid token', async () => {
    supabase.verifyAccessToken.mockResolvedValue(null);
    await asAdmin('get', '/admin/me').expect(401);
  });

  it('fails closed when the role check errors', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'down' } });
    const { body } = await asAdmin('get', '/admin/articles').expect(502);
    expect(JSON.stringify(body)).not.toContain('down');
  });

  it.each([
    ['a reserved slug', { slug: 'slugs' }],
    ['an invalid slug', { slug: 'Not Valid' }],
    ['a blank title', { title: '   ' }],
    ['a bad category id', { categoryId: 'nope' }],
    ['a bad tag id', { tagIds: ['nope'] }],
    ['repeated tags', { tagIds: [CATEGORY, CATEGORY] }],
    ['a made-up difficulty', { difficulty: 'impossible' }],
    ['a status, which only publish may change', { status: 'published' }],
    ['an author, which the database sets', { authorId: ID }],
    ['a reading time, which is computed', { readingTimeMinutes: 1 }],
  ])('rejects %s', async (_, change) => {
    await asAdmin('post', '/admin/articles')
      .send({ ...VALID_ARTICLE, ...change })
      .expect(400);
    expect(articles.save).not.toHaveBeenCalled();
  });

  it('requires the loaded version when updating', async () => {
    await asAdmin('put', `/admin/articles/${ID}`).send(VALID_ARTICLE).expect(400);
  });

  it('rejects a malformed id before reaching the database', async () => {
    await asAdmin('get', '/admin/articles/not-a-uuid').expect(400);
    expect(articles.findById).not.toHaveBeenCalled();
  });

  it('rejects an invalid publish date', async () => {
    await asAdmin('post', `/admin/articles/${ID}/publish`)
      .send({ publishedAt: 'tomorrow' })
      .expect(400);
  });

  it('refuses an image over the size limit', async () => {
    await asAdmin('post', '/admin/media/images')
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), 'big.png')
      .expect(413);
  });

  it('refuses a file disguised as an image', async () => {
    await asAdmin('post', '/admin/media/images')
      .attach('file', Buffer.from('<svg onload="alert(1)"/>'), {
        filename: 'photo.png',
        contentType: 'image/png',
      })
      .expect(400);
  });

  it('keeps public routes open', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200);
  });
});
