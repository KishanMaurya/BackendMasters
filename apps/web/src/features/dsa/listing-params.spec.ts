import { dsaApiPath, dsaHref, parseDsaFilters } from './listing-params';

describe('parseDsaFilters', () => {
  it('keeps valid values', () => {
    expect(parseDsaFilters({ topic: 'graphs', difficulty: 'hard', page: '2' })).toEqual({
      page: 2,
      topic: 'graphs',
      difficulty: 'hard',
    });
  });

  it('ignores anything unrecognised', () => {
    expect(parseDsaFilters({ topic: 'nope', difficulty: 'impossible', page: '-1' })).toEqual({
      page: 1,
    });
  });
});

describe('dsaHref', () => {
  it('leaves out defaults', () => {
    expect(dsaHref({})).toBe('/dsa');
    expect(dsaHref({ page: 1, topic: 'trees' })).toBe('/dsa?topic=trees');
  });
});

describe('dsaApiPath', () => {
  it('always states the page size', () => {
    expect(dsaApiPath({ page: 3, difficulty: 'easy' })).toBe(
      '/dsa-problems?page=3&pageSize=20&difficulty=easy',
    );
  });
});
