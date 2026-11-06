'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ARCHITECTURE_NODES, connectedLabels } from './graph';

const FlowCanvas = lazy(() => import('./flow-canvas'));

function Placeholder() {
  return <div aria-hidden className="h-[30rem] animate-pulse rounded-xl border bg-card" />;
}

/**
 * React Flow is large, so it loads only when this nears the screen. The same content is always
 * available as text below it, for screen readers and for anyone without JavaScript.
 */
export function ArchitectureExplorer() {
  const container = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} className="space-y-4">
      <p className="max-w-2xl text-sm text-muted-foreground">
        An online store&apos;s backend. Select a component to see what it does and how the system
        behaves when it fails, and drag components to rearrange them.
      </p>
      {near ? (
        <Suspense fallback={<Placeholder />}>
          <FlowCanvas />
        </Suspense>
      ) : (
        <Placeholder />
      )}
      <details className="rounded-xl border bg-card p-4 text-sm">
        <summary className="cursor-pointer font-medium">Read this architecture as text</summary>
        <dl className="mt-3 space-y-3">
          {ARCHITECTURE_NODES.map((node) => (
            <div key={node.id}>
              <dt className="font-medium">{node.label}</dt>
              <dd className="text-muted-foreground">
                {node.summary} If it fails: {node.whenItFails} Connects to:{' '}
                {connectedLabels(node.id).join(', ')}.
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
