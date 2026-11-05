import { listingHref, parseFilters, toSearchParams } from './listing-params';

describe('parseFilters', () => {
  it('reads valid filters', () => {
    expect(
      parseFilters({ page: '3', category: 'aws', difficulty: 'hard', tag: 'load-balancing' }),
    ).toEqual({ page: 3, category: 'aws', difficulty: 'hard', tag: 'load-balancing' });
  });

  it.each([
    [{ page: '0' }],
    [{ page: '-1' }],
    [{ page: '1.5' }],
    [{ page: 'abc' }],
    [{ category: 'nope' }],
    [{ difficulty: 'impossible' }],
    [{ tag: 'Bad Tag!' }],
    [{ tag: '../../secrets' }],
  ])('ignores %j', (raw) => {
    expect(parseFilters(raw)).toEqual({ page: 1 });
  });

  it('uses the first value when a parameter repeats', () => {
    expect(parseFilters({ category: ['dsa', 'aws'] }).category).toBe('dsa');
  });
});

describe('listing URLs', () => {
  it('builds clean links and leaves out page one', () => {
    expect(listingHref({})).toBe('/articles');
    expect(listingHref({ page: 1, category: 'dsa' })).toBe('/articles?category=dsa');
    expect(listingHref({ page: 2, tag: 'caching' })).toBe('/articles?tag=caching&page=2');
  });

  it('builds the API query', () => {
    expect(toSearchParams({ page: 2, difficulty: 'easy' }).toString()).toBe(
      'page=2&pageSize=12&difficulty=easy',
    );
  });
});
