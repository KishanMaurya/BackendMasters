import { NotFoundException } from '@nestjs/common';
import type { ArticleSummary } from '@backendmasters/shared';
import type { ArticlesRepository } from './articles.repository.js';
import { ArticlesService } from './articles.service.js';

const article = (slug: string) => ({ slug }) as ArticleSummary;

function setup(sameCategory: string[], newest: string[]) {
  const repository = {
    findBySlug: vi.fn().mockResolvedValue({ slug: 'self', categorySlug: 'hld' }),
    findPublished: vi.fn(({ category }: { category?: string }) =>
      Promise.resolve({
        items: (category ? sameCategory : newest).map(article),
        total: 0,
      }),
    ),
  };
  return {
    repository,
    service: new ArticlesService(repository as unknown as ArticlesRepository),
  };
}

const slugs = (items: ArticleSummary[]) => items.map((item) => item.slug);

describe('ArticlesService.getRelated', () => {
  it('prefers the same category and never includes the article itself', async () => {
    const { service, repository } = setup(['self', 'a', 'b', 'c'], ['x']);
    expect(slugs(await service.getRelated('self'))).toEqual(['a', 'b', 'c']);
    expect(repository.findPublished).toHaveBeenCalledTimes(1);
  });

  it('tops up from the newest articles without duplicates', async () => {
    const { service } = setup(['self', 'a'], ['self', 'a', 'x', 'y', 'z']);
    expect(slugs(await service.getRelated('self'))).toEqual(['a', 'x', 'y']);
  });

  it('returns what exists when there are too few articles', async () => {
    const { service } = setup(['self'], ['self']);
    expect(await service.getRelated('self')).toEqual([]);
  });

  it('throws 404 for an unknown article', async () => {
    const { service, repository } = setup([], []);
    repository.findBySlug.mockResolvedValue(null);
    await expect(service.getRelated('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
