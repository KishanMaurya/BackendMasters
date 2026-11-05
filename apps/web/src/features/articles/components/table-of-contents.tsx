'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/features/markdown/rehype-article';
import { cn } from '@/lib/utils';

/** How far below the top of the window a heading must pass to count as the current section. */
const ACTIVE_OFFSET_PX = 120;

function useActiveHeading(headings: readonly Heading[]): string | undefined {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      // The last heading already scrolled past, or the first one when above them all.
      let current = headings[0]?.id;
      for (const { id } of headings) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top === undefined || top > ACTIVE_OFFSET_PX) break;
        current = id;
      }
      setActive(current);
    }

    function schedule() {
      frame ||= requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [headings]);

  return active;
}

function Links({ headings, active }: { headings: readonly Heading[]; active?: string }) {
  return (
    <ul className="space-y-0.5 border-l text-sm">
      {headings.map((heading) => {
        const current = heading.id === active;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={current ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l-2 py-1 pr-2 transition-colors duration-(--motion-base)',
                heading.level === 3 ? 'pl-6' : 'pl-3.5',
                current
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function TableOfContents({ headings }: { headings: readonly Heading[] }) {
  const active = useActiveHeading(headings);

  return (
    <>
      <details className="rounded-xl border bg-card lg:hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">On this page</summary>
        <nav aria-label="On this page, compact" className="px-4 pb-4">
          <Links headings={headings} active={active} />
        </nav>
      </details>
      <nav
        aria-label="On this page"
        className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto lg:block"
      >
        <p className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          On this page
        </p>
        <Links headings={headings} active={active} />
      </nav>
    </>
  );
}
