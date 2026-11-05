import { toPlainExcerpt } from './search.repository.js';

describe('toPlainExcerpt', () => {
  it('removes Markdown markers', () => {
    expect(toPlainExcerpt('Use **bold** and `code`, see [the docs](https://x.dev).')).toBe(
      'Use bold and code, see the docs.',
    );
  });

  it('removes code blocks and images, and collapses whitespace', () => {
    expect(toPlainExcerpt('Before\n\n```js\nconst a = 1;\n```\n\n![alt](x.png)\n\nafter')).toBe(
      'Before alt after',
    );
  });

  it('shortens long text, without leaving a space before the ellipsis', () => {
    expect(toPlainExcerpt('word another more', 8)).toBe('word ano…');
    expect(toPlainExcerpt('word another', 5)).toBe('word…');
  });
});
