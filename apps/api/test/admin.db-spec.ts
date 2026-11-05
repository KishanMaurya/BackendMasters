/**
 * Runs the real admin API against local Supabase, signed in as the seeded local accounts.
 * Requires `npm run db:start`, `npm run db:reset` and an apps/api/.env. Run with `npm run test:db`.
 */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type { AdminArticle, AdminTag, DashboardStats } from '@backendmasters/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { RevalidationService } from '../src/modules/admin/revalidation.service.js';

const SLUG = 'admin-spec-article';
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

function anonClient(): SupabaseClient {
  return createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_PUBLISHABLE_KEY ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function signIn(email: string, password: string): Promise<string> {
  const { data, error } = await anonClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Sign-in failed for ${email}`);
  return data.session.access_token;
}

describe('Admin API (local Supabase)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let readerToken: string;
  let categoryId: string;
  let tagId: string;
  const revalidation = { revalidateContent: vi.fn(() => Promise.resolve(true)) };

  const server = () => request(app.getHttpServer());
  const asAdmin = (method: 'get' | 'post' | 'put' | 'patch' | 'delete', path: string) =>
    server()[method](`/api/v1${path}`).set('Authorization', `Bearer ${adminToken}`);

  const draft = (overrides: object = {}) => ({
    slug: SLUG,
    title: 'Admin spec article',
    description: 'A description',
    content: 'Some **content**',
    coverImageUrl: null,
    categoryId,
    difficulty: 'easy',
    seoTitle: null,
    seoDescription: null,
    isFeatured: false,
    tagIds: [],
    ...overrides,
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(RevalidationService)
      .useValue(revalidation)
      .compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();

    adminToken = await signIn('admin@backendmasters.test', 'local-admin-password');
    readerToken = await signIn('reader@backendmasters.test', 'local-reader-password');

    const { body } = await asAdmin('get', '/admin/categories').expect(200);
    categoryId = body.data[0].id;
    const tag = await asAdmin('post', '/admin/tags')
      .send({ slug: 'admin-spec-tag', name: 'Admin Spec Tag' })
      .expect(201);
    tagId = (tag.body.data as AdminTag).id;
  });

  afterAll(async () => {
    await asAdmin('delete', `/admin/tags/${tagId}`);
    await app.close();
  });

  describe('who gets in', () => {
    it('accepts the administrator', async () => {
      const { body } = await asAdmin('get', '/admin/me').expect(200);
      expect(body.data.displayName).toBe('Local Admin');
    });

    it('refuses a real reader account', async () => {
      await server()
        .get('/api/v1/admin/articles')
        .set('Authorization', `Bearer ${readerToken}`)
        .expect(403);
    });

    it('refuses a token with a tampered payload', async () => {
      const [header, payload, signature] = adminToken.split('.') as [string, string, string];
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as object;
      const forged = Buffer.from(
        JSON.stringify({ ...claims, sub: '10000000-0000-0000-0000-00000000000a', exp: 9999999999 }),
      ).toString('base64url');
      await server()
        .get('/api/v1/admin/me')
        .set('Authorization', `Bearer ${header}.${forged}.${signature}`)
        .expect(401);
    });

    it('refuses an unsigned token', async () => {
      const part = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
      const token = `${part({ alg: 'none' })}.${part({ sub: 'x', role: 'authenticated', exp: 9999999999 })}.`;
      await server().get('/api/v1/admin/me').set('Authorization', `Bearer ${token}`).expect(401);
    });

    it('refuses the publishable key used as a token', async () => {
      await server()
        .get('/api/v1/admin/me')
        .set('Authorization', `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`)
        .expect(401);
    });
  });

  describe('the database refuses even when the API is bypassed', () => {
    const readerClient = () =>
      createClient(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_PUBLISHABLE_KEY ?? '', {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${readerToken}` } },
      });

    it('stops a reader writing articles', async () => {
      const { error } = await readerClient()
        .from('articles')
        .insert({ slug: 'reader-write', title: 'x', category_id: categoryId });
      expect(error?.code).toBe('42501');
    });

    it('stops a reader making themselves an admin', async () => {
      const { error } = await readerClient()
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', '10000000-0000-0000-0000-00000000000b');
      expect(error).not.toBeNull();
    });

    it('stops a reader uploading images', async () => {
      const { error } = await readerClient()
        .storage.from('article-covers')
        .upload('reader/x.png', PNG, { contentType: 'image/png' });
      expect(error).not.toBeNull();
    });

    it('does not offer sign-ups', async () => {
      const { error } = await anonClient().auth.signUp({
        email: 'new@backendmasters.test',
        password: 'a-long-password-1',
      });
      expect(error).not.toBeNull();
    });
  });

  describe('the publishing workflow', () => {
    let article: AdminArticle;
    const publicGet = (path: string) => server().get(`/api/v1${path}`);

    it('creates a hidden draft with a computed reading time and its tags', async () => {
      const { body } = await asAdmin('post', '/admin/articles')
        .send(draft({ tagIds: [tagId] }))
        .expect(201);
      article = body.data as AdminArticle;

      expect(article.state).toBe('draft');
      expect(article.readingTimeMinutes).toBe(1);
      expect(article.tagIds).toEqual([tagId]);
      await publicGet(`/articles/${SLUG}`).expect(404);
    });

    it('lists the draft for the admin only', async () => {
      const { body } = await asAdmin('get', '/admin/articles?state=draft&q=spec').expect(200);
      expect(body.data.map((item: AdminArticle) => item.slug)).toContain(SLUG);
      expect(body.meta.pagination.total).toBeGreaterThan(0);
    });

    it('treats wildcards in a search as plain text', async () => {
      const { body } = await asAdmin('get', '/admin/articles?q=%25').expect(200);
      expect(body.data).toEqual([]);
    });

    it('rejects a slug another article uses', async () => {
      await asAdmin('post', '/admin/articles')
        .send(draft({ slug: 'cache-stampede-explained' }))
        .expect(409);
    });

    it('saves edits and replaces tags together', async () => {
      const { body } = await asAdmin('put', `/admin/articles/${article.id}`)
        .send(draft({ title: 'Edited', expectedUpdatedAt: article.updatedAt }))
        .expect(200);
      expect(body.data.result.title).toBe('Edited');
      expect(body.data.result.tagIds).toEqual([]);

      const stale = article.updatedAt;
      article = body.data.result as AdminArticle;

      const conflict = await asAdmin('put', `/admin/articles/${article.id}`)
        .send(draft({ title: 'Overwrite', expectedUpdatedAt: stale }))
        .expect(409);
      expect(conflict.body.error.message).toContain('changed since');
    });

    it('rolls back the whole save when a tag does not exist', async () => {
      await asAdmin('put', `/admin/articles/${article.id}`)
        .send(
          draft({
            title: 'Should not persist',
            tagIds: ['99999999-9999-4999-8999-999999999999'],
            expectedUpdatedAt: article.updatedAt,
          }),
        )
        .expect(409);
      const { body } = await asAdmin('get', `/admin/articles/${article.id}`).expect(200);
      expect(body.data.title).toBe('Edited');
    });

    it('schedules: published, but hidden until its date', async () => {
      revalidation.revalidateContent.mockClear();
      const { body } = await asAdmin('post', `/admin/articles/${article.id}/publish`)
        .send({ publishedAt: '2099-01-01T00:00:00Z' })
        .expect(200);

      expect(body.data.result.state).toBe('scheduled');
      expect(revalidation.revalidateContent).toHaveBeenCalledOnce();
      await publicGet(`/articles/${SLUG}`).expect(404);
    });

    it('publishes now, even after being scheduled', async () => {
      const { body } = await asAdmin('post', `/admin/articles/${article.id}/publish`)
        .send({})
        .expect(200);

      expect(body.data.result.state).toBe('published');
      const live = await publicGet(`/articles/${SLUG}`).expect(200);
      expect(live.body.data.title).toBe('Edited');
      article = body.data.result as AdminArticle;
    });

    it('never reveals admin-only fields publicly', async () => {
      const { body } = await publicGet(`/articles/${SLUG}`).expect(200);
      expect(body.data).not.toHaveProperty('state');
      expect(body.data).not.toHaveProperty('status');
    });

    it('unpublishes, hiding it again', async () => {
      const { body } = await asAdmin('post', `/admin/articles/${article.id}/unpublish`).expect(200);
      expect(body.data.result.state).toBe('draft');
      await publicGet(`/articles/${SLUG}`).expect(404);
    });

    it('refuses to publish an empty article', async () => {
      const empty = await asAdmin('post', '/admin/articles')
        .send(draft({ slug: 'admin-spec-empty', content: '' }))
        .expect(201);
      const id = (empty.body.data as AdminArticle).id;
      await asAdmin('post', `/admin/articles/${id}/publish`).send({}).expect(422);
      await asAdmin('delete', `/admin/articles/${id}`).expect(200);
    });

    it('counts it on the dashboard', async () => {
      const { body } = await asAdmin('get', '/admin/stats').expect(200);
      const stats = body.data as DashboardStats;
      expect(stats.articles.drafts).toBeGreaterThanOrEqual(2);
      expect(stats.categories).toBe(8);
      expect(stats.recent[0]?.slug).toBe(SLUG);
    });

    it('deletes permanently, and a second delete finds nothing', async () => {
      await asAdmin('delete', `/admin/articles/${article.id}`).expect(200);
      await asAdmin('delete', `/admin/articles/${article.id}`).expect(404);
    });
  });

  describe('images', () => {
    it('stores a real image that anyone can then fetch', async () => {
      const { body } = await asAdmin('post', '/admin/media/images')
        .attach('file', PNG, 'anything.txt')
        .expect(201);

      expect(body.data.url).toMatch(/\/article-covers\/\d{4}\/[0-9a-f-]{36}\.png$/);
      const response = await fetch(body.data.url as string);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('image/png');
    });

    it('accepts an uploaded image as a cover, and refuses a foreign one', async () => {
      const upload = await asAdmin('post', '/admin/media/images').attach('file', PNG, 'a.png');
      const created = await asAdmin('post', '/admin/articles')
        .send(draft({ slug: 'admin-spec-cover', coverImageUrl: upload.body.data.url }))
        .expect(201);
      await asAdmin('delete', `/admin/articles/${created.body.data.id}`).expect(200);

      await asAdmin('post', '/admin/articles')
        .send(draft({ slug: 'admin-spec-foreign', coverImageUrl: 'https://evil.example/a.png' }))
        .expect(400);
    });
  });

  describe('categories and tags', () => {
    it('renames a tag and reports the count', async () => {
      const { body } = await asAdmin('patch', `/admin/tags/${tagId}`)
        .send({ slug: 'admin-spec-tag', name: 'Renamed' })
        .expect(200);
      expect(body.data.result).toMatchObject({ name: 'Renamed', articleCount: 0 });
    });

    it('rejects a duplicate tag slug', async () => {
      await asAdmin('post', '/admin/tags').send({ slug: 'caching', name: 'Again' }).expect(409);
    });

    it('edits a category and restores it', async () => {
      const { name, description, sortOrder } = (
        await asAdmin('get', '/admin/categories').expect(200)
      ).body.data[0];

      const { body } = await asAdmin('patch', `/admin/categories/${categoryId}`)
        .send({ name: 'Temporary', description, sortOrder })
        .expect(200);
      expect(body.data.result.name).toBe('Temporary');

      await asAdmin('patch', `/admin/categories/${categoryId}`)
        .send({ name, description, sortOrder })
        .expect(200);
    });

    it('has no way to create or delete a category', async () => {
      await asAdmin('post', '/admin/categories').send({}).expect(404);
      await asAdmin('delete', `/admin/categories/${categoryId}`).expect(404);
    });
  });
});
