import { renderToStaticMarkup } from 'react-dom/server';
import type { ArticleSummary } from '@backendmasters/shared';
import { contentLabel } from '@/components/catalog/category-card';
import { ArticleCard, formatDate } from './article-card';

const ARTICLE: ArticleSummary = {
  id: '1',
  slug: 'load-balancing',
  title: 'How load balancers work',
  description: 'Routing requests across servers.',
  categorySlug: 'hld',
  categoryName: 'High-Level Design',
  coverImageUrl: null,
  readingTimeMinutes: 12,
  difficulty: 'medium',
  publishedAt: '2026-03-01T00:00:00.000Z',
  isFeatured: false,
};

describe('ArticleCard', () => {
  it('shows every required field and links to the article', () => {
    const html = renderToStaticMarkup(<ArticleCard article={ARTICLE} />);

    for (const text of [ARTICLE.title, ARTICLE.description, ARTICLE.categoryName, '12 min read']) {
      expect(html).toContain(text);
    }
    expect(html).toContain('href="/articles/load-balancing"');
    expect(html).toContain('dateTime="2026-03-01T00:00:00.000Z"');
  });

  it('falls back to the category illustration without a cover image', () => {
    expect(renderToStaticMarkup(<ArticleCard article={ARTICLE} />)).toContain('<svg');
  });

  it('uses the cover image when one exists', () => {
    const html = renderToStaticMarkup(
      <ArticleCard article={{ ...ARTICLE, coverImageUrl: 'https://cdn.example.com/cover.png' }} />,
    );
    expect(html).toContain('<img');
  });
});

describe('formatDate', () => {
  it('formats in UTC, so a date never shifts by timezone', () => {
    expect(formatDate('2026-03-01T00:00:00.000Z')).toBe('1 Mar 2026');
    expect(formatDate('2026-03-01T23:59:00.000Z')).toBe('1 Mar 2026');
  });
});

describe('contentLabel', () => {
  it('prefers article counts and falls back to planned topics', () => {
    expect(contentLabel(3, 12)).toBe('3 articles');
    expect(contentLabel(1, 12)).toBe('1 article');
    expect(contentLabel(0, 12)).toBe('12 topics');
    expect(contentLabel(undefined, 12)).toBe('12 topics');
  });
});
