import { pageMetadata } from './metadata';

const PAGE = { title: 'A page', description: 'About it', path: '/a-page' };

describe('pageMetadata', () => {
  it('sets a canonical address and social details', () => {
    const metadata = pageMetadata(PAGE);
    expect(metadata.alternates?.canonical).toBe('/a-page');
    expect(metadata.openGraph?.title).toBe('A page | BackendMasters');
    expect(metadata.openGraph?.url).toBe('/a-page');
  });

  it('always has a share image, because setting openGraph replaces the default', () => {
    expect(pageMetadata(PAGE).openGraph?.images).toEqual(['/opengraph-image']);
    expect(pageMetadata(PAGE).twitter?.images).toEqual(['/opengraph-image']);
  });

  it('prefers a cover image', () => {
    const metadata = pageMetadata({ ...PAGE, image: 'https://cdn/cover.png' });
    expect(metadata.openGraph?.images).toEqual(['https://cdn/cover.png']);
  });

  it('allows indexing unless told otherwise', () => {
    expect(pageMetadata(PAGE).robots).toBeUndefined();
    expect(pageMetadata({ ...PAGE, noindex: true }).robots).toEqual({ index: false, follow: true });
  });

  it('marks article pages', () => {
    const metadata = pageMetadata({
      ...PAGE,
      article: { publishedTime: 'p', modifiedTime: 'm' },
    });
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: 'p',
      modifiedTime: 'm',
    });
  });
});
