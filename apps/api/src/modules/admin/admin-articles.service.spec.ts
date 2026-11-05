import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { AdminArticle, ArticleInput } from '@backendmasters/shared';
import type { AdminContext } from '../../common/auth/admin.guard.js';
import type { Env } from '../../config/env.js';
import type { AdminArticlesRepository } from './admin-articles.repository.js';
import { escapeLike } from './admin-articles.repository.js';
import { articleState } from './admin-articles.mapper.js';
import {
  AdminArticlesService,
  estimateReadingTime,
  resolvePublishDate,
} from './admin-articles.service.js';
import type { RevalidationService } from './revalidation.service.js';

const ADMIN: AdminContext = { id: 'admin', accessToken: 'token' };
const STORAGE = 'https://x.supabase.co/storage/v1/object/public/article-covers/';

const INPUT: ArticleInput = {
  slug: 'a',
  title: 'A',
  description: 'Text',
  content: 'one two three',
  coverImageUrl: null,
  categoryId: 'c',
  difficulty: null,
  seoTitle: null,
  seoDescription: null,
  isFeatured: false,
  tagIds: [],
};

function article(overrides: Partial<AdminArticle> = {}): AdminArticle {
  return { id: 'id', state: 'draft', publishedAt: null, ...INPUT, ...overrides } as AdminArticle;
}

function setup(existing: AdminArticle | null = article()) {
  const repository = {
    save: vi.fn(() => Promise.resolve('id')),
    findById: vi.fn(() => Promise.resolve(existing)),
    setStatus: vi.fn(() => Promise.resolve(existing !== null)),
    delete: vi.fn(() => Promise.resolve(existing !== null)),
    list: vi.fn(),
  };
  const revalidation = { revalidateContent: vi.fn(() => Promise.resolve(true)) };
  const config = { get: () => 'https://x.supabase.co' };
  const service = new AdminArticlesService(
    repository as unknown as AdminArticlesRepository,
    revalidation as unknown as RevalidationService,
    config as unknown as ConfigService<Env, true>,
  );
  return { service, repository, revalidation };
}

describe('estimateReadingTime', () => {
  it('is at least one minute, even when empty', () => {
    expect(estimateReadingTime('')).toBe(1);
    expect(estimateReadingTime('   \n ')).toBe(1);
  });

  it('rounds up at 200 words a minute', () => {
    expect(estimateReadingTime(Array(200).fill('word').join(' '))).toBe(1);
    expect(estimateReadingTime(Array(201).fill('word').join('\n'))).toBe(2);
  });
});

describe('resolvePublishDate', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('uses the requested date, normalized', () => {
    expect(resolvePublishDate('2026-07-01T05:30:00+05:30', null, now)).toBe(
      '2026-07-01T00:00:00.000Z',
    );
  });

  it('keeps an earlier date, so republishing does not make an article look new', () => {
    expect(resolvePublishDate(undefined, '2026-01-01T00:00:00Z', now)).toBe('2026-01-01T00:00:00Z');
  });

  it('leaves the date to the database when never published', () => {
    expect(resolvePublishDate(undefined, null, now)).toBeNull();
  });

  it('publishes a formerly scheduled article now, rather than leaving it hidden', () => {
    expect(resolvePublishDate(undefined, '2026-12-01T00:00:00Z', now)).toBeNull();
  });
});

describe('articleState', () => {
  const now = new Date('2026-06-01T00:00:00Z');

  it('tells drafts, scheduled and live articles apart', () => {
    expect(articleState('draft', '2026-01-01T00:00:00Z', now)).toBe('draft');
    expect(articleState('published', '2026-01-01T00:00:00Z', now)).toBe('published');
    expect(articleState('published', '2026-12-01T00:00:00Z', now)).toBe('scheduled');
  });
});

describe('escapeLike', () => {
  it('stops wildcards matching everything', () => {
    expect(escapeLike('100%_a\\')).toBe('100\\%\\_a\\\\');
  });
});

describe('AdminArticlesService', () => {
  it('computes reading time and blanks empty SEO fields when saving', async () => {
    const { service, repository } = setup();
    await service.create(ADMIN, { ...INPUT, seoTitle: '  ', seoDescription: 'Kept' });
    expect(repository.save).toHaveBeenCalledWith(
      ADMIN,
      expect.objectContaining({
        id: null,
        readingTimeMinutes: 1,
        seoTitle: null,
        seoDescription: 'Kept',
      }),
    );
  });

  it('only accepts cover images from our own storage', async () => {
    const { service, repository } = setup();
    await expect(
      service.create(ADMIN, { ...INPUT, coverImageUrl: 'https://evil.example/x.png' }),
    ).rejects.toThrow(BadRequestException);
    // A prefix check must not be fooled by our host appearing later in the address.
    await expect(
      service.create(ADMIN, { ...INPUT, coverImageUrl: `https://evil.example/${STORAGE}` }),
    ).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();

    await service.create(ADMIN, { ...INPUT, coverImageUrl: `${STORAGE}2026/a.png` });
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('does not refresh the site for a draft, which no reader can see', async () => {
    const { service, revalidation } = setup();
    const change = await service.update(ADMIN, 'id', { ...INPUT, expectedUpdatedAt: 't' });
    expect(revalidation.revalidateContent).not.toHaveBeenCalled();
    expect(change.revalidated).toBe(true);
  });

  it.each(['published', 'scheduled'] as const)(
    'refreshes the site for a %s article',
    async (state) => {
      const { service, revalidation } = setup(article({ state }));
      await service.update(ADMIN, 'id', { ...INPUT, expectedUpdatedAt: 't' });
      expect(revalidation.revalidateContent).toHaveBeenCalledOnce();
    },
  );

  it('passes the expected version through, to catch a stale save', async () => {
    const { service, repository } = setup();
    await service.update(ADMIN, 'id', { ...INPUT, expectedUpdatedAt: 'version' });
    expect(repository.save).toHaveBeenCalledWith(
      ADMIN,
      expect.objectContaining({ id: 'id', expectedUpdatedAt: 'version' }),
    );
  });

  it.each([{ description: ' ' }, { content: '\n' }])(
    'refuses to publish an article missing content: %j',
    async (missing) => {
      const { service, repository } = setup(article(missing));
      await expect(service.publish(ADMIN, 'id')).rejects.toThrow(UnprocessableEntityException);
      expect(repository.setStatus).not.toHaveBeenCalled();
    },
  );

  it('publishes and reports whether the site was refreshed', async () => {
    const { service, repository, revalidation } = setup();
    revalidation.revalidateContent.mockResolvedValue(false);
    const change = await service.publish(ADMIN, 'id', '2030-01-01T00:00:00Z');
    expect(repository.setStatus).toHaveBeenCalledWith(ADMIN, 'id', {
      status: 'published',
      publishedAt: '2030-01-01T00:00:00.000Z',
    });
    expect(change.revalidated).toBe(false);
  });

  it('reports a missing article on every action', async () => {
    const { service } = setup(null);
    await expect(service.get(ADMIN, 'id')).rejects.toThrow(NotFoundException);
    await expect(service.publish(ADMIN, 'id')).rejects.toThrow(NotFoundException);
    await expect(service.unpublish(ADMIN, 'id')).rejects.toThrow(NotFoundException);
    await expect(service.delete(ADMIN, 'id')).rejects.toThrow(NotFoundException);
  });
});
