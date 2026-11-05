'use client';

import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { CopyButton } from './copy-button';

const COLLAPSE_ABOVE_LINES = 24;

export function CodeFrame({
  code,
  language,
  children,
}: {
  code: string;
  language: string;
  children: ReactNode;
}) {
  const lines = code.split('\n').length;
  const collapsible = lines > COLLAPSE_ABOVE_LINES;
  const [expanded, setExpanded] = useState(false);
  const collapsed = collapsible && !expanded;

  return (
    <figure className="bm-code" data-collapsed={collapsed || undefined}>
      <figcaption className="bm-code-bar">
        <span>{language}</span>
        <CopyButton text={code} subject={`${language} code`} />
      </figcaption>
      <div className="bm-code-body">{children}</div>
      {collapsible && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="bm-code-toggle"
        >
          <ChevronDown aria-hidden className="size-4" />
          {expanded ? 'Show less' : `Show all ${lines} lines`}
        </button>
      )}
    </figure>
  );
}
