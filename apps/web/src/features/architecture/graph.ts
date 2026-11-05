export type NodeKind = 'client' | 'edge' | 'service' | 'cache' | 'database' | 'queue' | 'storage';

export interface ArchitectureNode {
  id: string;
  label: string;
  kind: NodeKind;
  summary: string;
  whenItFails: string;
  /** Position on a wide screen. */
  wide: { x: number; y: number };
  /** Position on a narrow screen. */
  narrow: { x: number; y: number };
}

export interface ArchitectureEdge {
  source: string;
  target: string;
  label?: string;
  /** Asynchronous, drawn as moving dashes. */
  async?: boolean;
}

export const ARCHITECTURE_NODES: readonly ArchitectureNode[] = [
  {
    id: 'client',
    label: 'Client',
    kind: 'client',
    summary: 'A browser or mobile app. It only ever talks to the public edge.',
    whenItFails: 'Retries with backoff, so a blip on the server doesn’t become a retry storm.',
    wide: { x: 0, y: 150 },
    narrow: { x: 90, y: 0 },
  },
  {
    id: 'cdn',
    label: 'CDN',
    kind: 'edge',
    summary: 'Serves static files and cached pages from a location near the user.',
    whenItFails: 'Traffic can fall back to the origin, which must be able to take the extra load.',
    wide: { x: 170, y: 50 },
    narrow: { x: 0, y: 90 },
  },
  {
    id: 'gateway',
    label: 'API gateway',
    kind: 'edge',
    summary: 'The single entry point for APIs. It handles auth, rate limits and routing.',
    whenItFails: 'Everything behind it is unreachable, so run several instances across zones.',
    wide: { x: 170, y: 250 },
    narrow: { x: 180, y: 90 },
  },
  {
    id: 'orders',
    label: 'Order service',
    kind: 'service',
    summary: 'Stateless business logic. Being stateless is what makes it easy to scale out.',
    whenItFails: 'The load balancer stops sending traffic to an unhealthy instance.',
    wide: { x: 340, y: 150 },
    narrow: { x: 0, y: 190 },
  },
  {
    id: 'payments',
    label: 'Payment service',
    kind: 'service',
    summary: 'Talks to the payment provider. Calls use idempotency keys, so retries are safe.',
    whenItFails:
      'A circuit breaker stops calls to a failing provider, and orders wait in a pending state.',
    wide: { x: 340, y: 300 },
    narrow: { x: 180, y: 190 },
  },
  {
    id: 'redis',
    label: 'Redis cache',
    kind: 'cache',
    summary: 'Holds frequently read data in memory, taking load off the database.',
    whenItFails: 'Reads fall through to the database, which may not cope with the full load.',
    wide: { x: 520, y: 0 },
    narrow: { x: 0, y: 290 },
  },
  {
    id: 'database',
    label: 'PostgreSQL',
    kind: 'database',
    summary: 'The source of truth. Writes go to the primary, and replicas can serve reads.',
    whenItFails:
      'A replica is promoted. Writes pause briefly, and recent ones can be lost if replication is asynchronous.',
    wide: { x: 520, y: 110 },
    narrow: { x: 180, y: 290 },
  },
  {
    id: 'kafka',
    label: 'Kafka',
    kind: 'queue',
    summary: 'A durable event log. Services publish facts without knowing who consumes them.',
    whenItFails: 'Producers buffer and retry. Consumers resume from their last committed offset.',
    wide: { x: 520, y: 220 },
    narrow: { x: 0, y: 390 },
  },
  {
    id: 'worker',
    label: 'Notification worker',
    kind: 'service',
    summary: 'Consumes events and does slow work outside the request, such as sending email.',
    whenItFails:
      'Events wait in Kafka and are processed on recovery, so handlers must be idempotent.',
    wide: { x: 700, y: 220 },
    narrow: { x: 180, y: 390 },
  },
  {
    id: 'storage',
    label: 'Object storage',
    kind: 'storage',
    summary: 'Durable storage for files such as invoices and images, served through the CDN.',
    whenItFails:
      'Highly durable, but a regional outage is possible, so replicate anything critical.',
    wide: { x: 700, y: 50 },
    narrow: { x: 90, y: 490 },
  },
];

export const ARCHITECTURE_EDGES: readonly ArchitectureEdge[] = [
  { source: 'client', target: 'cdn' },
  { source: 'client', target: 'gateway' },
  { source: 'gateway', target: 'orders' },
  { source: 'orders', target: 'payments' },
  { source: 'orders', target: 'redis' },
  { source: 'orders', target: 'database' },
  { source: 'orders', target: 'kafka', label: 'order.created', async: true },
  { source: 'kafka', target: 'worker', async: true },
  { source: 'worker', target: 'storage' },
  { source: 'cdn', target: 'storage' },
];

/** The services a node talks to directly, in either direction. */
export function connectedLabels(id: string): string[] {
  const ids = ARCHITECTURE_EDGES.flatMap(({ source, target }) =>
    source === id ? [target] : target === id ? [source] : [],
  );
  return ARCHITECTURE_NODES.filter((node) => ids.includes(node.id)).map((node) => node.label);
}

export interface EdgeHandles {
  sourceHandle: 'right' | 'bottom' | 'top';
  targetHandle: 'left' | 'top' | 'bottom';
}

/** Leaves from the side facing the target, so lines don't loop behind their own nodes. */
export function chooseHandles(
  source: { x: number; y: number },
  target: { x: number; y: number },
): EdgeHandles {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (dx > 0 && Math.abs(dx) >= Math.abs(dy))
    return { sourceHandle: 'right', targetHandle: 'left' };
  return dy >= 0
    ? { sourceHandle: 'bottom', targetHandle: 'top' }
    : { sourceHandle: 'top', targetHandle: 'bottom' };
}
