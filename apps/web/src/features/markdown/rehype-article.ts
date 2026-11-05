import type { Element, ElementContent, Root } from 'hast';
import { toString } from 'hast-util-to-string';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { highlight, languageLabel, normalizeLanguage } from './highlighter';

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

const NOTE_MARKER = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/;

function languageOf(code: Element): string | undefined {
  const classes = code.properties.className;
  if (!Array.isArray(classes)) return undefined;
  const match = classes.map(String).find((name) => name.startsWith('language-'));
  return match?.slice('language-'.length);
}

async function transformCodeBlock(pre: Element, code: Element): Promise<void> {
  const source = toString(code).replace(/\n$/, '');
  const language = normalizeLanguage(languageOf(code));

  if (languageOf(code) === 'mermaid') {
    pre.properties = { dataMermaid: 'true', dataCode: source };
    pre.children = [];
    return;
  }

  const highlighted = await highlight(source, language);
  pre.properties = {
    ...highlighted.properties,
    dataCode: source,
    dataLanguage: languageLabel(language),
  };
  pre.children = highlighted.children;
}

/** Turns GitHub-style `> [!NOTE]` blockquotes into notes. */
function transformNote(blockquote: Element): void {
  const paragraph = blockquote.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === 'p',
  );
  const first = paragraph?.children[0];
  if (!paragraph || first?.type !== 'text') return;

  const match = NOTE_MARKER.exec(first.value);
  if (!match?.[1]) return;

  first.value = first.value.slice(match[0].length);
  if (first.value === '') paragraph.children.shift();
  blockquote.tagName = 'aside';
  blockquote.properties = { dataNote: match[1].toLowerCase() };
}

/**
 * Runs after sanitizing, so its own trusted output isn't stripped:
 * highlights code, marks Mermaid diagrams and notes, and collects the table of contents.
 */
export const rehypeArticle: Plugin<[{ headings: Heading[] }], Root> = ({ headings }) => {
  return async (tree) => {
    const blocks: [Element, Element][] = [];

    visit(tree, 'element', (node) => {
      // The page title is the only h1, so a heading in the article body steps down a level.
      if (node.tagName === 'h1') node.tagName = 'h2';

      if (node.tagName === 'h2' || node.tagName === 'h3') {
        const id = node.properties.id;
        if (typeof id === 'string') {
          headings.push({ id, text: toString(node), level: node.tagName === 'h2' ? 2 : 3 });
        }
      }

      if (node.tagName === 'blockquote') transformNote(node);

      if (node.tagName === 'pre') {
        const code = (node.children as ElementContent[]).find(
          (child): child is Element => child.type === 'element' && child.tagName === 'code',
        );
        if (code) blocks.push([node, code]);
      }
    });

    await Promise.all(blocks.map(([pre, code]) => transformCodeBlock(pre, code)));
  };
};
