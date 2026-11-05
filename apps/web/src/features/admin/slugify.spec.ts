import { slugify } from './slugify';

describe('slugify', () => {
  it.each([
    ['What Is a Cache Stampede?', 'what-is-a-cache-stampede'],
    ['  Trim   spaces  ', 'trim-spaces'],
    ['Résumé & Café', 'resume-and-cafe'],
    ['C++ / Rust: 2026!', 'c-rust-2026'],
    ['---', ''],
    ['हिन्दी', ''],
  ])('%s becomes "%s"', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it('stays within the limit without ending in a hyphen', () => {
    const slug = slugify(`${'a'.repeat(119)} b`);
    expect(slug.length).toBeLessThanOrEqual(120);
    expect(slug.endsWith('-')).toBe(false);
  });
});
