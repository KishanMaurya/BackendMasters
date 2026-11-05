import { CircleAlert, Info, Lightbulb, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import type { Components } from 'react-markdown';
import { LazyExplainer } from '@/features/explainers/lazy-explainer';
import { isExplainerName } from '@/features/explainers/names';
import { CodeFrame } from './code-frame';
import { MermaidDiagram } from './mermaid-diagram';

type DataProps = {
  'data-code'?: string;
  'data-explainer'?: string;
  'data-language'?: string;
  'data-mermaid'?: string;
  'data-note'?: string;
  node?: unknown;
};

const NOTES = {
  note: { label: 'Note', icon: Info },
  tip: { label: 'Tip', icon: Lightbulb },
  important: { label: 'Important', icon: CircleAlert },
  warning: { label: 'Warning', icon: TriangleAlert },
  caution: { label: 'Caution', icon: OctagonAlert },
} as const;

function Pre(props: ComponentProps<'pre'> & DataProps) {
  const {
    'data-code': code = '',
    'data-language': language = 'Text',
    'data-mermaid': mermaid,
    'data-explainer': explainer,
    node: _node,
    ...rest
  } = props;

  if (mermaid) return <MermaidDiagram code={code} />;
  // An unknown name, such as a typo, shows nothing to readers rather than a broken block.
  if (explainer !== undefined) {
    return isExplainerName(explainer) ? <LazyExplainer name={explainer} /> : null;
  }

  return (
    <CodeFrame code={code} language={language}>
      <pre {...rest} tabIndex={0} />
    </CodeFrame>
  );
}

function Aside(props: ComponentProps<'aside'> & DataProps) {
  const { 'data-note': kind, children, node: _node, ...rest } = props;
  const note = NOTES[kind as keyof typeof NOTES] ?? NOTES.note;
  const Icon = note.icon;

  return (
    <aside {...rest} className="bm-note" data-kind={kind} aria-label={note.label}>
      <p className="bm-note-title">
        <Icon aria-hidden className="size-4" />
        {note.label}
      </p>
      {children}
    </aside>
  );
}

function headingWithAnchor(Tag: 'h2' | 'h3') {
  return function Heading({
    id,
    children,
    node: _node,
    ...rest
  }: ComponentProps<'h2'> & DataProps) {
    return (
      <Tag id={id} {...rest}>
        <a href={`#${id}`} className="bm-heading-link">
          {children as ReactNode}
        </a>
      </Tag>
    );
  };
}

export const markdownComponents: Components = {
  pre: Pre,
  aside: Aside,
  h2: headingWithAnchor('h2'),
  h3: headingWithAnchor('h3'),
  table({ node: _node, ...props }) {
    return (
      // A group, not a region: an article can have many tables, and landmarks must be unique.
      <div className="bm-table" tabIndex={0} role="group" aria-label="Table, scrollable">
        <table {...props} />
      </div>
    );
  },
  a({ node: _node, href, ...props }) {
    const external = href?.startsWith('http');
    return (
      <a
        href={href}
        {...props}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      />
    );
  },
  img({ node: _node, alt, ...props }) {
    return (
      // Sizes aren't known for images inside Markdown, which next/image requires.
      // eslint-disable-next-line @next/next/no-img-element
      <img {...props} alt={alt ?? ''} loading="lazy" decoding="async" className="bm-image" />
    );
  },
};
