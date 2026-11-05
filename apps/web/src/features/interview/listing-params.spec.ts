import {
  interviewApiPath,
  interviewHref,
  parseInterviewFilters,
  plainPreview,
} from './listing-params';

describe('parseInterviewFilters', () => {
  it('keeps valid values and reads the short category parameter', () => {
    expect(
      parseInterviewFilters({
        q: ' event loop ',
        technology: 'Node.js',
        difficulty: 'medium',
        category: 'Concepts',
      }),
    ).toEqual({
      page: 1,
      q: 'event loop',
      technology: 'Node.js',
      difficulty: 'medium',
      interviewCategory: 'Concepts',
    });
  });

  it('ignores blank and overlong values', () => {
    expect(parseInterviewFilters({ q: '   ', technology: 'x'.repeat(61), topic: '' })).toEqual({
      page: 1,
    });
  });

  it('caps the search length', () => {
    expect(parseInterviewFilters({ q: 'x'.repeat(200) }).q).toHaveLength(100);
  });
});

describe('URLs', () => {
  it('uses the short name on the site and the API name for the API', () => {
    const filters = { page: 1, interviewCategory: 'Concepts' };
    expect(interviewHref(filters)).toBe('/interview-questions?category=Concepts');
    expect(interviewApiPath(filters)).toContain('interviewCategory=Concepts');
  });

  it('encodes technology names', () => {
    expect(interviewHref({ technology: 'System Design' })).toBe(
      '/interview-questions?technology=System+Design',
    );
  });
});

describe('plainPreview', () => {
  it('removes Markdown markers', () => {
    expect(plainPreview('Use `unknown` and **not** _any_')).toBe('Use unknown and not any');
  });
});
