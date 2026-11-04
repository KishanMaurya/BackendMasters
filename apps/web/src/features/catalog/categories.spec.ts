import { CATEGORY_SLUGS } from '@backendmasters/shared';
import { CATEGORY_ILLUSTRATIONS } from '@/components/illustrations';
import { CATEGORIES, getCategory, topicAnchor } from './categories';
import { LEARNING_PATHS } from './paths';

describe('catalog', () => {
  it('defines exactly one category for every slug, with an illustration', () => {
    expect(CATEGORIES.map((category) => category.slug).sort()).toEqual([...CATEGORY_SLUGS].sort());
    for (const slug of CATEGORY_SLUGS) expect(CATEGORY_ILLUSTRATIONS[slug]).toBeDefined();
  });

  it('routes each category to its own path', () => {
    for (const category of CATEGORIES) expect(category.href).toBe(`/${category.slug}`);
  });

  it('gives each topic a unique anchor within its category', () => {
    for (const { topics, name } of CATEGORIES) {
      const anchors = topics.map(topicAnchor);
      expect(new Set(anchors).size, name).toBe(topics.length);
      expect(anchors.every(Boolean), name).toBe(true);
    }
  });

  it('never relates a category to itself', () => {
    for (const { slug, related } of CATEGORIES) expect(related).not.toContain(slug);
  });

  it('builds readable anchors', () => {
    expect(topicAnchor('Node.js')).toBe('node-js');
    expect(topicAnchor('SLI, SLO, SLA')).toBe('sli-slo-sla');
  });

  it('throws on an unknown category', () => {
    expect(() => getCategory('nope' as never)).toThrow(/Unknown category/);
  });

  it('uses only known categories in learning paths', () => {
    for (const path of LEARNING_PATHS) {
      for (const station of path.stations) expect(CATEGORY_SLUGS).toContain(station);
    }
  });
});
