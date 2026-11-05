/** Kept out of the client component, because the Markdown renderer checks names on the server. */
export const EXPLAINER_NAMES = [
  'load-balancer',
  'caching',
  'sharding',
  'kafka',
  'tracing',
  'sliding-window',
] as const;

export type ExplainerName = (typeof EXPLAINER_NAMES)[number];

export function isExplainerName(name: string): name is ExplainerName {
  return (EXPLAINER_NAMES as readonly string[]).includes(name);
}
