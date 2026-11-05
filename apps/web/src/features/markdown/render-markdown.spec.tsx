import { renderToStaticMarkup } from 'react-dom/server';
import { renderMarkdown } from './render-markdown';

async function render(markdown: string) {
  const { content, headings } = await renderMarkdown(markdown);
  return { html: renderToStaticMarkup(content), headings };
}

describe('renderMarkdown', () => {
  it('renders the common elements', async () => {
    const { html } = await render(
      [
        'Text with **bold** and `inline`.',
        '- one\n- two',
        '1. first\n2. second',
        '> A quotation',
        '| A | B |\n|---|---|\n| 1 | 2 |',
        '![Alt text](/picture.png)',
      ].join('\n\n'),
    );

    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code>inline</code>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<ol>');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<table>');
    expect(html).toContain('alt="Alt text"');
    expect(html).toContain('loading="lazy"');
  });

  it.each([
    ['javascript', 'js'],
    ['typescript', 'ts'],
    ['go', 'go'],
    ['java', 'java'],
    ['python', 'py'],
    ['sql', 'sql'],
    ['bash', 'sh'],
    ['json', 'json'],
  ])('highlights %s, including the alias %s', async (name, alias) => {
    for (const language of [name, alias]) {
      const { html } = await render(`\`\`\`${language}\nconst value = 1\n\`\`\``);
      expect(html).toContain('class="shiki');
      expect(html).toContain('--shiki-dark');
      expect(html).toContain('--shiki-light');
    }
  });

  it('labels code and shows a copy button holding the original source', async () => {
    const { html } = await render('```ts\nconst a = 1 < 2;\n```');
    expect(html).toContain('TypeScript');
    expect(html).toContain('aria-label="Copy TypeScript code"');
  });

  it('falls back to plain text for an unknown language', async () => {
    const { html } = await render('```brainfuck\n+++\n```');
    expect(html).toContain('Text');
    expect(html).toContain('+++');
  });

  it('collapses long code and leaves short code open', async () => {
    const long = await render(`\`\`\`ts\n${'x\n'.repeat(30)}\`\`\``);
    expect(long.html).toContain('Show all 30 lines');
    const short = await render('```ts\nx\n```');
    expect(short.html).not.toContain('Show all');
  });

  it('keeps Mermaid out of the highlighter, showing the source until it draws', async () => {
    const { html } = await render('```mermaid\ngraph TD; A-->B;\n```');
    expect(html).toContain('bm-diagram');
    expect(html).toContain('graph TD; A--&gt;B;');
    expect(html).not.toContain('shiki');
  });

  it.each([
    ['NOTE', 'Note'],
    ['TIP', 'Tip'],
    ['IMPORTANT', 'Important'],
    ['WARNING', 'Warning'],
    ['CAUTION', 'Caution'],
  ])('turns [!%s] into a note', async (marker, label) => {
    const { html } = await render(`> [!${marker}]\n> Be careful here.`);
    expect(html).toContain(`aria-label="${label}"`);
    expect(html).toContain('Be careful here.');
    expect(html).not.toContain(`[!${marker}]`);
    expect(html).not.toContain('<blockquote');
  });

  it('collects h2 and h3 for the contents, with unique ids matching the page', async () => {
    const { html, headings } = await render('## Scaling\n\n### Reads\n\n#### Skip\n\n## Scaling');
    expect(headings).toEqual([
      { id: 'scaling', text: 'Scaling', level: 2 },
      { id: 'reads', text: 'Reads', level: 3 },
      { id: 'scaling-1', text: 'Scaling', level: 2 },
    ]);
    for (const { id } of headings) expect(html).toContain(`id="${id}"`);
  });

  it('steps an h1 in the body down, because the page title is the only h1', async () => {
    const { html } = await render('# Title in body');
    expect(html).not.toContain('<h1');
    expect(html).toContain('<h2');
  });

  it('opens external links safely and leaves internal ones alone', async () => {
    const { html } = await render('[out](https://example.com) [in](/dsa)');
    expect(html).toContain('href="https://example.com" target="_blank" rel="noopener noreferrer"');
    expect(html).toMatch(/href="\/dsa"(?! target)/);
  });

  describe('sanitizing', () => {
    it.each([
      ['a script tag', '<script>alert(1)</script>'],
      ['an event handler', '<img src="x" onerror="alert(1)">'],
      ['an iframe', '<iframe src="https://evil.test"></iframe>'],
      ['a style tag', '<style>body{display:none}</style>'],
    ])('never renders %s as HTML', async (_name, payload) => {
      const { html } = await render(`Before\n\n${payload}\n\nAfter`);
      expect(html).not.toMatch(/<script|<iframe|<style|<img[^>]*onerror/i);
      expect(html).toContain('After');
    });

    it.each([
      ['a link', '[click](javascript:alert(1))'],
      ['an encoded link', '[click](JaVaScRiPt:alert(1))'],
      ['an image', '![x](javascript:alert(1))'],
      ['a data link', '[click](data:text/html,<script>alert(1)</script>)'],
    ])('removes a dangerous URL in %s', async (_name, payload) => {
      const { html } = await render(payload);
      expect(html.toLowerCase()).not.toContain('javascript:');
      expect(html.toLowerCase()).not.toContain('data:text');
    });

    it('does not let a raw HTML data attribute impersonate a Mermaid block', async () => {
      const { html } = await render('<pre data-mermaid="true" data-code="x"></pre>');
      expect(html).not.toContain('bm-diagram');
    });

    it('does not let a raw HTML id clobber page elements', async () => {
      const { html } = await render('<div id="article-body">x</div>');
      expect(html).not.toContain('id="article-body"');
    });
  });
});
