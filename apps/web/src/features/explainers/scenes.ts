/** The logic behind each explainer, kept apart from drawing so it can be tested. */

// --- Load balancer

export type BalancingAlgorithm = 'round-robin' | 'least-connections';

export interface BalancingStep {
  request: number;
  server: number;
  /** Open connections per server after this request lands. */
  connections: number[];
}

export const SERVER_NAMES = ['Server A', 'Server B', 'Server C'] as const;
/** Server A starts busy, which is what separates the two algorithms. */
const INITIAL_CONNECTIONS = [4, 1, 0];

export function simulateBalancing(algorithm: BalancingAlgorithm, requests = 6): BalancingStep[] {
  const connections = [...INITIAL_CONNECTIONS];
  const steps: BalancingStep[] = [];
  for (let request = 0; request < requests; request++) {
    const server =
      algorithm === 'round-robin'
        ? request % connections.length
        : connections.indexOf(Math.min(...connections));
    connections[server] = (connections[server] as number) + 1;
    steps.push({ request: request + 1, server, connections: [...connections] });
  }
  return steps;
}

export function initialConnections(): number[] {
  return [...INITIAL_CONNECTIONS];
}

// --- Sharding

export interface ShardRecord {
  userId: number;
  shard: number;
}

export const SHARD_USER_IDS = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008] as const;

export function shardFor(userId: number, shards: number): number {
  return userId % shards;
}

export function assignShards(userIds: readonly number[], shards = 3): ShardRecord[] {
  return userIds.map((userId) => ({ userId, shard: shardFor(userId, shards) }));
}

/** How many keys change shard when the shard count changes. */
export function movedKeys(userIds: readonly number[], from: number, to: number): number {
  return userIds.filter((userId) => shardFor(userId, from) !== shardFor(userId, to)).length;
}

// --- Kafka

export interface KafkaMessage {
  key: string;
  partition: number;
}

export interface KafkaFrame {
  caption: string;
  /** Messages on each partition's log. */
  logs: KafkaMessage[][];
  /** Next offset to read, per partition. */
  offsets: number[];
  active?: { kind: 'produce' | 'consume'; partition: number };
}

const KAFKA_KEYS = ['user-1', 'user-2', 'user-1', 'user-3', 'user-2'] as const;
const PARTITIONS = 2;

/** A simple stable hash, standing in for the real partitioner. */
export function partitionFor(key: string, partitions = PARTITIONS): number {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) % 1_000_003;
  return hash % partitions;
}

export function buildKafkaFrames(): KafkaFrame[] {
  const logs: KafkaMessage[][] = Array.from({ length: PARTITIONS }, () => []);
  const offsets = Array.from({ length: PARTITIONS }, () => 0);
  const snapshot = () => ({ logs: logs.map((log) => [...log]), offsets: [...offsets] });
  const frames: KafkaFrame[] = [
    {
      caption: 'A topic is split into partitions. Each one is an append-only log.',
      ...snapshot(),
    },
  ];

  for (const key of KAFKA_KEYS) {
    const partition = partitionFor(key);
    (logs[partition] as KafkaMessage[]).push({ key, partition });
    frames.push({
      caption: `The producer sends ${key}. The key decides the partition, so all of a key's messages stay in order on partition ${partition}.`,
      ...snapshot(),
      active: { kind: 'produce', partition },
    });
  }

  for (let partition = 0; partition < PARTITIONS; partition++) {
    const log = logs[partition] as KafkaMessage[];
    for (let offset = 0; offset < log.length; offset++) {
      offsets[partition] = offset + 1;
      frames.push({
        caption: `Consumer ${partition === 0 ? 'A' : 'B'} reads offset ${offset} of partition ${partition}, then commits. Messages stay on the log after being read.`,
        ...snapshot(),
        active: { kind: 'consume', partition },
      });
    }
  }
  return frames;
}

// --- Sliding window

export interface WindowStep {
  start: number;
  end: number;
  longest: number;
  caption: string;
}

/** Runs the real algorithm from the Longest Substring problem, recording each step. */
export function slidingWindowSteps(text: string): WindowStep[] {
  const lastSeen = new Map<string, number>();
  let start = 0;
  let longest = 0;
  const steps: WindowStep[] = [];

  for (let end = 0; end < text.length; end++) {
    const char = text[end] as string;
    const previous = lastSeen.get(char);
    const repeated = previous !== undefined && previous >= start;
    if (repeated) start = previous + 1;
    lastSeen.set(char, end);
    longest = Math.max(longest, end - start + 1);
    steps.push({
      start,
      end,
      longest,
      caption: repeated
        ? `"${char}" is already in the window, so start jumps past its last position. Longest so far: ${longest}.`
        : `"${char}" is new, so the window grows. Longest so far: ${longest}.`,
    });
  }
  return steps;
}

// --- Tracing

export interface TraceSpan {
  service: string;
  startMs: number;
  durationMs: number;
}

export const TRACE_SPANS: readonly TraceSpan[] = [
  { service: 'API gateway', startMs: 0, durationMs: 240 },
  { service: 'Orders', startMs: 10, durationMs: 220 },
  { service: 'Inventory', startMs: 20, durationMs: 30 },
  { service: 'Payments', startMs: 55, durationMs: 165 },
  { service: 'Database', startMs: 65, durationMs: 140 },
];

/** The span doing the most work itself, once time spent waiting on its children is removed. */
export function slowestSelfTime(spans: readonly TraceSpan[]): TraceSpan {
  const selfTime = (span: TraceSpan) => {
    const children = spans.filter(
      (other) =>
        other !== span &&
        other.startMs >= span.startMs &&
        other.startMs + other.durationMs <= span.startMs + span.durationMs &&
        !spans.some(
          (middle) =>
            middle !== span &&
            middle !== other &&
            middle.startMs >= span.startMs &&
            middle.startMs + middle.durationMs <= span.startMs + span.durationMs &&
            other.startMs >= middle.startMs &&
            other.startMs + other.durationMs <= middle.startMs + middle.durationMs,
        ),
    );
    return span.durationMs - children.reduce((total, child) => total + child.durationMs, 0);
  };
  return spans.reduce((slowest, span) => (selfTime(span) > selfTime(slowest) ? span : slowest));
}
