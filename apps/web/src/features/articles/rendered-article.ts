import { cacheLife } from 'next/cache';
import { renderMarkdown, type RenderedMarkdown } from '@/features/markdown/render-markdown';

/**
 * The output depends only on the Markdown, so it's cached by content for as long as possible.
 * This also lets the highlighter's use of the clock run during prerendering.
 */
export async function renderArticle(markdown: string): Promise<RenderedMarkdown> {
  'use cache';
  cacheLife('max');
  return renderMarkdown(markdown);
}
