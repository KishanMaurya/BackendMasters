'use client';

import { lazy, Suspense, useEffect, useRef, type ComponentType } from 'react';
import type { ExplainerName } from './names';

function Placeholder() {
  return <div aria-hidden className="h-96 animate-pulse rounded-xl border bg-card" />;
}

/**
 * The server renders the explainer straight away. In the browser its code waits until `show` is
 * called, and React leaves the server's HTML on screen until then.
 */
function deferred(load: () => Promise<{ default: ComponentType }>) {
  let show = () => {};
  const nearScreen = new Promise<void>((resolve) => {
    show = resolve;
  });
  const Component = lazy(async () => {
    if (typeof window !== 'undefined') await nearScreen;
    return load();
  });
  return { Component, show };
}

/** Each explainer is its own small chunk, so a page only loads the ones a reader reaches. */
const EXPLAINERS: Record<ExplainerName, ReturnType<typeof deferred>> = {
  'load-balancer': deferred(() => import('./load-balancer')),
  caching: deferred(() => import('./caching')),
  sharding: deferred(() => import('./sharding')),
  kafka: deferred(() => import('./kafka')),
  tracing: deferred(() => import('./tracing')),
  'sliding-window': deferred(() => import('./sliding-window')),
};

export function LazyExplainer({ name }: { name: ExplainerName }) {
  const { Component, show } = EXPLAINERS[name];
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          show();
          observer.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [show]);

  return (
    <div ref={container}>
      <Suspense fallback={<Placeholder />}>
        <Component />
      </Suspense>
    </div>
  );
}
