'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ExplainerName } from './names';

function Placeholder() {
  return <div aria-hidden className="h-96 animate-pulse rounded-xl border bg-card" />;
}

/** Each explainer is its own small chunk, so a page only loads the ones it shows. */
const EXPLAINERS = {
  'load-balancer': dynamic(() => import('./load-balancer'), { loading: Placeholder }),
  caching: dynamic(() => import('./caching'), { loading: Placeholder }),
  sharding: dynamic(() => import('./sharding'), { loading: Placeholder }),
  kafka: dynamic(() => import('./kafka'), { loading: Placeholder }),
  tracing: dynamic(() => import('./tracing'), { loading: Placeholder }),
  'sliding-window': dynamic(() => import('./sliding-window'), { loading: Placeholder }),
} satisfies Record<ExplainerName, ComponentType>;

export function LazyExplainer({ name }: { name: ExplainerName }) {
  const Component = EXPLAINERS[name];
  return <Component />;
}
