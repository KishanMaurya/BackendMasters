import { articleData, breadcrumbData, serializeJsonLd, websiteData } from './structured-data';

const SITE = 'https://backendmasters.in';

describe('serializeJsonLd', () => {
  it('cannot be closed early by content', () => {
    const json = serializeJsonLd({ headline: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json).headline).toBe('</script><script>alert(1)</script>');
  });
});

describe('breadcrumbData', () => {
  it('numbers items from one, with absolute addresses', () => {
    const data = breadcrumbData(SITE, [
      { name: 'Home', path: '/' },
      { name: 'DSA', path: '/dsa' },
    ]);
    expect(data.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'DSA',
      item: 'https://backendmasters.in/dsa',
    });
  });
});

describe('articleData', () => {
  const article = {
    title: 'A title',
    description: 'A description',
    path: '/articles/a',
    publishedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  };

  it('uses the publisher as author when there is no person', () => {
    expect(articleData(SITE, article).author).toMatchObject({ '@type': 'Organization' });
  });

  it('names a person when there is one, and includes the image', () => {
    const data = articleData(SITE, { ...article, authorName: 'Ada', imageUrl: 'https://x/a.png' });
    expect(data.author).toEqual({ '@type': 'Person', name: 'Ada' });
    expect(data.image).toBe('https://x/a.png');
    expect(data.mainEntityOfPage).toBe('https://backendmasters.in/articles/a');
  });

  it('leaves out a missing image', () => {
    expect(articleData(SITE, article)).not.toHaveProperty('image');
  });
});

describe('websiteData', () => {
  it('describes how to search', () => {
    expect(websiteData(SITE).potentialAction.target).toBe(
      'https://backendmasters.in/search?q={search_term_string}',
    );
  });
});
