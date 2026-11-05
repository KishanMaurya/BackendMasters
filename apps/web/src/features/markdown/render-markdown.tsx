import { MarkdownAsync } from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import type { ReactElement } from 'react';
import { markdownComponents } from './markdown-components';
import { rehypeArticle, type Heading } from './rehype-article';

export interface RenderedMarkdown {
  content: ReactElement;
  headings: Heading[];
}

const SANITIZE_SCHEMA = {
  ...defaultSchema,
  clobber: [],
};

export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const headings: Heading[] = [];

  const content = await MarkdownAsync({
    children: markdown,
    remarkPlugins: [remarkGfm],
    // Order matters: sanitize untrusted input first, then add trusted output.
    rehypePlugins: [[rehypeSanitize, SANITIZE_SCHEMA], rehypeSlug, [rehypeArticle, { headings }]],
    components: markdownComponents,
  });

  return { content, headings };
}
