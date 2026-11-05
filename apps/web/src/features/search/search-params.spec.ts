import { parseSearchFilters, searchApiPath, searchHref } from './search-params';

describe('parseSearchFilters', () => {
  it('keeps valid values', () => {
    expect(parseSearchFilters({ q: ' cache ', category: 'hld', tag: 'redis', page: '2' })).toEqual({
      q: 'cache',
      page: 2,
      category: 'hld',
      tag: 'redis',
    });
  });

  it('ignores anything unusable', () => {
    expect(parseSearchFilters({ category: 'nope', tag: 'Not Valid', page: '0' })).toEqual({
      q: '',
      page: 1,
    });
  });

  it('caps the query length', () => {
    expect(parseSearchFilters({ q: 'x'.repeat(200) }).q).toHaveLength(100);
  });
});

describe('URLs', () => {
  it('leaves out what is empty', () => {
    expect(searchHref({})).toBe('/search');
    expect(searchHref({ q: 'a b', page: 1 })).toBe('/search?q=a+b');
    expect(searchHref({ q: 'a', page: 2 })).toBe('/search?q=a&page=2');
  });

  it('always states the page for the API', () => {
    expect(searchApiPath({ q: 'a', page: 1, tag: 'redis' })).toBe(
      '/search?q=a&tag=redis&page=1&pageSize=12',
    );
  });
});
