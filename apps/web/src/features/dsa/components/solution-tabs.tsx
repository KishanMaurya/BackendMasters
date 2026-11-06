'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { tabIndexForKey } from '../tab-navigation';

/** The code is highlighted on the server, so switching language only shows another panel. */
export function SolutionTabs({
  solutions,
}: {
  solutions: { key: string; label: string; content: ReactNode }[];
}) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent) => {
    const next = tabIndexForKey(event.key, selected, solutions.length);
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Solution language"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-1"
      >
        {solutions.map(({ key, label }, index) => (
          <button
            key={key}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${key}`}
            aria-controls={`${id}-panel-${key}`}
            aria-selected={index === selected}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-(--motion-fast) outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
              'aria-selected:bg-muted aria-selected:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {solutions.map(({ key, content }, index) => (
        <div
          key={key}
          role="tabpanel"
          id={`${id}-panel-${key}`}
          aria-labelledby={`${id}-tab-${key}`}
          hidden={index !== selected}
          className="mt-3"
        >
          {content}
        </div>
      ))}
    </div>
  );
}
