'use client';

import { Tabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The code is highlighted on the server, so switching language only shows another panel. */
export function SolutionTabs({
  solutions,
}: {
  solutions: { key: string; label: string; content: ReactNode }[];
}) {
  return (
    <Tabs.Root defaultValue={solutions[0]?.key}>
      <Tabs.List aria-label="Solution language" className="flex flex-wrap gap-1">
        {solutions.map(({ key, label }) => (
          <Tabs.Tab
            key={key}
            value={key}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-(--motion-fast) outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
              'data-[selected]:bg-muted data-[selected]:text-foreground',
            )}
          >
            {label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {solutions.map(({ key, content }) => (
        <Tabs.Panel key={key} value={key} keepMounted className="mt-3 data-[hidden]:hidden">
          {content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
