/**
 * Runs the learning modules against local Supabase with its development seed.
 * Requires `npm run db:start`, `npm run db:reset` and an apps/api/.env. Run with `npm run test:db`.
 */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createClient } from '@supabase/supabase-js';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import type {
  AdminDsaProblem,
  AdminInterviewQuestion,
  DsaProblemSummary,
  InterviewQuestionSummary,
} from '@backendmasters/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { RevalidationService } from '../src/modules/admin/revalidation.service.js';

const SOLUTIONS = { javascript: 'js', typescript: 'ts', java: 'java', go: 'go' };

describe('Learning modules (local Supabase)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  const revalidation = { revalidateContent: vi.fn(() => Promise.resolve(true)) };

  const get = (path: string) => request(app.getHttpServer()).get(`/api/v1${path}`);
  const asAdmin = (method: 'get' | 'post' | 'put' | 'delete', path: string) =>
    request(app.getHttpServer())
      [method](`/api/v1${path}`)
      .set('Authorization', `Bearer ${adminToken}`);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(RevalidationService)
      .useValue(revalidation)
      .compile();
    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();

    const client = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data } = await client.auth.signInWithPassword({
      email: 'admin@backendmasters.test',
      password: 'local-admin-password',
    });
    adminToken = data.session?.access_token ?? '';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('public DSA API', () => {
    const slugs = (body: { data: DsaProblemSummary[] }) => body.data.map(({ slug }) => slug);

    it('lists published problems and hides drafts', async () => {
      const { body } = await get('/dsa-problems').expect(200);
      expect(slugs(body)).toContain('two-sum');
      expect(slugs(body)).not.toContain('draft-reverse-linked-list');
      expect(body.meta.pagination.total).toBe(3);
    });

    it('filters by difficulty and topic', async () => {
      const hard = await get('/dsa-problems?difficulty=hard').expect(200);
      expect(slugs(hard.body)).toEqual(['trapping-rain-water']);
      const topic = await get('/dsa-problems?topic=hash-maps&difficulty=easy').expect(200);
      expect(slugs(topic.body)).toEqual(['two-sum']);
    });

    it('rejects an unknown filter value', async () => {
      await get('/dsa-problems?topic=alchemy').expect(400);
    });

    it('returns an empty page past the end, with the real total', async () => {
      const { body } = await get('/dsa-problems?page=9').expect(200);
      expect(body.data).toEqual([]);
    });

    it('returns a full problem, with all four languages', async () => {
      const { body } = await get('/dsa-problems/two-sum').expect(200);
      expect(Object.keys(body.data.solutions).sort()).toEqual([
        'go',
        'java',
        'javascript',
        'typescript',
      ]);
      expect(body.data.examples[0].output).toBe('[0, 1]');
      expect(body.data.constraints.length).toBeGreaterThan(0);
    });

    it('hides a draft, and reserves its fixed routes', async () => {
      await get('/dsa-problems/draft-reverse-linked-list').expect(404);
      const topics = await get('/dsa-problems/topics').expect(200);
      expect(topics.body.data).toContainEqual({ topic: 'hash-maps', count: 1 });
      expect(topics.body.data.map((item: { topic: string }) => item.topic)).not.toContain(
        'linked-lists',
      );
      const listed = await get('/dsa-problems/slugs').expect(200);
      expect(listed.body.data).not.toContain('draft-reverse-linked-list');
    });
  });

  describe('public interview API', () => {
    const slugs = (body: { data: InterviewQuestionSummary[] }) => body.data.map(({ slug }) => slug);

    it('searches words in questions and answers', async () => {
      const { body } = await get('/interview-questions?q=visibility').expect(200);
      expect(slugs(body)).toEqual(['aws-sqs-visibility-timeout']);
    });

    it('treats odd search text as plain words', async () => {
      const { body } = await get(
        `/interview-questions?q=${encodeURIComponent(`' OR 1=1; -- <script>`)}`,
      ).expect(200);
      expect(body.data).toEqual([]);
    });

    it('combines every filter', async () => {
      const { body } = await get(
        '/interview-questions?technology=Node.js&topic=Concurrency&difficulty=medium&interviewCategory=Concepts',
      ).expect(200);
      expect(slugs(body)).toEqual(['node-event-loop']);
    });

    it('hides drafts from lists, search and facets', async () => {
      const search = await get('/interview-questions?q=backpressure').expect(200);
      expect(search.body.data).toEqual([]);
      await get('/interview-questions/draft-node-streams').expect(404);
      const facets = await get('/interview-questions/facets').expect(200);
      expect(facets.body.data.topics).not.toContain('Streams');
      expect(facets.body.data.technologies).toContain('Node.js');
    });

    it('includes published related questions', async () => {
      const { body } = await get('/interview-questions/node-event-loop').expect(200);
      expect(body.data.related.map((item: { slug: string }) => item.slug)).toEqual([
        'js-promise-all-vs-allsettled',
      ]);
    });
  });

  describe('tag usage', () => {
    it('counts published articles in one category only', async () => {
      const { body } = await get('/tags/usage?category=lld').expect(200);
      expect(body.data).toContainEqual({ slug: 'design-patterns', articleCount: 1 });
      expect(body.data.map((item: { slug: string }) => item.slug)).not.toContain('sqs');
    });

    it('rejects an unknown category', async () => {
      await get('/tags/usage?category=nope').expect(400);
    });
  });

  describe('managing DSA problems', () => {
    let problem: AdminDsaProblem;
    const input = {
      slug: 'db-spec-problem',
      title: 'DB spec problem',
      topic: 'graphs',
      difficulty: 'medium',
      problemStatement: '',
      examples: [],
      constraints: [],
      bruteForceApproach: '',
      optimizedApproach: '',
      explanation: '',
      timeComplexity: '',
      spaceComplexity: '',
      dryRun: '',
      solutions: { javascript: '', typescript: '', java: '', go: '' },
    };

    it('creates a hidden draft', async () => {
      const { body } = await asAdmin('post', '/admin/dsa-problems').send(input).expect(201);
      problem = body.data as AdminDsaProblem;
      expect(problem.status).toBe('draft');
      await get('/dsa-problems/db-spec-problem').expect(404);
    });

    it('refuses to publish while sections are missing', async () => {
      const { body } = await asAdmin('post', `/admin/dsa-problems/${problem.id}/publish`).expect(
        422,
      );
      expect(body.error.message).toContain('Go solution');
    });

    it('rejects a stale save', async () => {
      const complete = {
        ...input,
        problemStatement: 'Statement',
        examples: [{ input: 'a', output: 'b' }],
        optimizedApproach: 'Approach',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        solutions: SOLUTIONS,
      };
      const saved = await asAdmin('put', `/admin/dsa-problems/${problem.id}`)
        .send({ ...complete, expectedUpdatedAt: problem.updatedAt })
        .expect(200);
      const conflict = await asAdmin('put', `/admin/dsa-problems/${problem.id}`)
        .send({ ...complete, expectedUpdatedAt: problem.updatedAt })
        .expect(409);
      expect(conflict.body.error.message).toContain('changed since');
      problem = saved.body.data.result as AdminDsaProblem;
    });

    it('publishes, then unpublishes, refreshing the site each time', async () => {
      revalidation.revalidateContent.mockClear();
      await asAdmin('post', `/admin/dsa-problems/${problem.id}/publish`).expect(200);
      const live = await get('/dsa-problems/db-spec-problem').expect(200);
      expect(live.body.data.solutions.go).toBe('go');

      await asAdmin('post', `/admin/dsa-problems/${problem.id}/unpublish`).expect(200);
      await get('/dsa-problems/db-spec-problem').expect(404);
      expect(revalidation.revalidateContent).toHaveBeenCalledTimes(2);
    });

    it('rejects a duplicate slug', async () => {
      await asAdmin('post', '/admin/dsa-problems')
        .send({ ...input, slug: 'two-sum' })
        .expect(409);
    });

    it('lists drafts for admins, then deletes', async () => {
      const { body } = await asAdmin('get', '/admin/dsa-problems').expect(200);
      expect(body.data.map((item: AdminDsaProblem) => item.slug)).toContain('db-spec-problem');
      await asAdmin('delete', `/admin/dsa-problems/${problem.id}`).expect(200);
      await asAdmin('delete', `/admin/dsa-problems/${problem.id}`).expect(404);
    });
  });

  describe('managing interview questions', () => {
    let question: AdminInterviewQuestion;
    const input = {
      slug: 'db-spec-question',
      title: 'DB spec question?',
      technology: 'Spec',
      topic: 'Testing',
      interviewCategory: '  ',
      difficulty: 'easy',
      shortAnswer: '',
      detailedExplanation: '',
      practicalExample: '',
      codeExample: '',
      codeLanguage: 'go',
      relatedQuestionIds: [],
    };

    it('creates a hidden draft, tidying optional fields', async () => {
      const { body } = await asAdmin('post', '/admin/interview-questions').send(input).expect(201);
      question = body.data as AdminInterviewQuestion;
      expect(question.interviewCategory).toBeNull();
      // A language means nothing without code.
      expect(question.codeLanguage).toBeNull();
      await get('/interview-questions/db-spec-question').expect(404);
    });

    it('refuses to publish without a short answer', async () => {
      await asAdmin('post', `/admin/interview-questions/${question.id}/publish`).expect(422);
    });

    it('publishes, appearing in facets, then deletes', async () => {
      const saved = await asAdmin('put', `/admin/interview-questions/${question.id}`)
        .send({ ...input, shortAnswer: 'An answer', expectedUpdatedAt: question.updatedAt })
        .expect(200);
      expect(saved.body.data.result.shortAnswer).toBe('An answer');

      await asAdmin('post', `/admin/interview-questions/${question.id}/publish`).expect(200);
      const facets = await get('/interview-questions/facets').expect(200);
      expect(facets.body.data.technologies).toContain('Spec');

      await asAdmin('delete', `/admin/interview-questions/${question.id}`).expect(200);
      const after = await get('/interview-questions/facets').expect(200);
      expect(after.body.data.technologies).not.toContain('Spec');
    });
  });
});
