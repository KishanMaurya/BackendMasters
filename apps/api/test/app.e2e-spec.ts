// ConfigModule reads the environment when AppModule is imported, so this has to run before imports.
// It stops a developer's real .env from influencing this suite or being contacted by it.
vi.hoisted(() => {
  for (const key of ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY']) {
    process.env[key] = '';
  }
});

import { Body, Controller, Get, INestApplication, Module, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

class EchoDto {
  @IsString()
  value: string;
}

/** Test-only routes that reach the failure paths no real endpoint can trigger yet. */
@Controller('probe')
class ProbeController {
  @Post('echo')
  echo(@Body() body: EchoDto): EchoDto {
    return body;
  }

  @Get('boom')
  boom(): never {
    throw new Error('database password is hunter2');
  }
}

@Module({ controllers: [ProbeController] })
class ProbeModule {}

describe('API (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, ProbeModule],
    }).compile();

    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/health', () => {
    it('returns status in the success envelope', async () => {
      const { body } = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(body.data).toMatchObject({
        status: 'ok',
        version: expect.any(String),
        uptimeSeconds: expect.any(Number),
        dependencies: { supabase: 'not_configured' },
      });
      expect(body.meta.requestId).toEqual(expect.any(String));
      expect(Date.parse(body.meta.timestamp)).not.toBeNaN();
    });

    it('sets security headers', async () => {
      const { headers } = await request(app.getHttpServer()).get('/api/v1/health');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('request IDs', () => {
    it('echoes a safe incoming ID', async () => {
      const { headers, body } = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('x-request-id', 'trace-123');
      expect(headers['x-request-id']).toBe('trace-123');
      expect(body.meta.requestId).toBe('trace-123');
    });

    it('replaces an unsafe incoming ID', async () => {
      const { headers } = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set('x-request-id', 'bad id <script>');
      expect(headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  describe('error envelope', () => {
    it('returns 404 for unknown routes', async () => {
      const { body } = await request(app.getHttpServer()).get('/api/v1/nope').expect(404);
      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.meta.requestId).toEqual(expect.any(String));
      expect(body.data).toBeUndefined();
    });

    it('reports validation failures with details', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/v1/probe/echo')
        .send({ value: 1 })
        .expect(400);
      expect(body.error.code).toBe('BAD_REQUEST');
      expect(body.error.message).toBe('Validation failed');
      expect(body.error.details).toEqual(
        expect.arrayContaining([expect.stringContaining('value')]),
      );
    });

    it('rejects properties a DTO does not declare', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/v1/probe/echo')
        .send({ value: 'ok', isAdmin: true })
        .expect(400);
      expect(body.error.details).toEqual(
        expect.arrayContaining([expect.stringContaining('isAdmin')]),
      );
    });

    it('hides internal error details from clients', async () => {
      const { body, text } = await request(app.getHttpServer())
        .get('/api/v1/probe/boom')
        .expect(500);
      expect(body.error.code).toBe('INTERNAL_ERROR');
      expect(text).not.toContain('hunter2');
    });
  });

  describe('Swagger', () => {
    it('serves the OpenAPI document with the health route', async () => {
      const { body } = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
      expect(body.info.title).toBe('BackendMasters API');
      expect(body.paths['/api/v1/health']).toBeDefined();
    });
  });
});
