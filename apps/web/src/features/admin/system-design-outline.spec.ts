import { missingSections, systemDesignOutline } from './system-design-outline';

describe('system design outline', () => {
  it('has all ten sections', () => {
    expect(systemDesignOutline().match(/^## /gm)).toHaveLength(10);
  });

  it('finds nothing missing in the outline itself', () => {
    expect(missingSections(systemDesignOutline())).toEqual([]);
  });

  it('reports what is missing, ignoring case', () => {
    const missing = missingSections('## PROBLEM STATEMENT\n\nText about trade-offs.');
    expect(missing).not.toContain('Problem statement');
    // A mention in a sentence isn't a section.
    expect(missing).toContain('Trade-offs');
    expect(missing).toHaveLength(9);
  });
});
