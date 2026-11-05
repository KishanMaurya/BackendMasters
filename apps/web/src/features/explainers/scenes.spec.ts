import {
  assignShards,
  buildKafkaFrames,
  initialConnections,
  movedKeys,
  partitionFor,
  shardFor,
  simulateBalancing,
  slidingWindowSteps,
  slowestSelfTime,
  TRACE_SPANS,
} from './scenes';

describe('simulateBalancing', () => {
  it('round robin rotates, whatever the load', () => {
    expect(simulateBalancing('round-robin').map((step) => step.server)).toEqual([0, 1, 2, 0, 1, 2]);
  });

  it('least connections avoids the busy server', () => {
    const steps = simulateBalancing('least-connections');
    expect(steps.map((step) => step.server)).not.toContain(0);
    expect(steps.at(-1)?.connections).toEqual([4, 4, 3]);
  });

  it('adds exactly one connection per request', () => {
    const start = initialConnections().reduce((a, b) => a + b);
    simulateBalancing('least-connections').forEach((step, index) => {
      expect(step.connections.reduce((a, b) => a + b)).toBe(start + index + 1);
    });
  });
});

describe('sharding', () => {
  it('routes by modulo', () => {
    expect(shardFor(1001, 3)).toBe(2);
    expect(assignShards([1002, 1003])).toEqual([
      { userId: 1002, shard: 0 },
      { userId: 1003, shard: 1 },
    ]);
  });

  it('counts the keys that move when a shard is added', () => {
    expect(movedKeys([12, 15], 3, 4)).toBe(1);
    expect(movedKeys([1, 2, 3], 3, 3)).toBe(0);
  });
});

describe('Kafka frames', () => {
  const frames = buildKafkaFrames();

  it('keeps every message of a key on the same partition', () => {
    expect(partitionFor('user-1')).toBe(partitionFor('user-1'));
    const final = frames.at(-1)?.logs ?? [];
    for (const log of final) {
      for (const { key, partition } of log) expect(partition).toBe(partitionFor(key));
    }
  });

  it('never loses a message, and reads everything by the end', () => {
    const final = frames.at(-1);
    expect(final?.logs.flat()).toHaveLength(5);
    expect(final?.offsets).toEqual(final?.logs.map((log) => log.length));
  });

  it('fits the four slots drawn per partition', () => {
    for (const log of frames.at(-1)?.logs ?? []) expect(log.length).toBeLessThanOrEqual(4);
  });
});

describe('slidingWindowSteps', () => {
  it.each([
    ['abcabcbb', 3],
    ['bbbbb', 1],
    ['pwwkew', 3],
    ['abba', 2],
  ])('finds the same answer as the published solution for %s', (text, answer) => {
    expect(slidingWindowSteps(text).at(-1)?.longest).toBe(answer);
  });

  it('only ever moves the window forward', () => {
    const steps = slidingWindowSteps('abba');
    steps.slice(1).forEach((step, index) => {
      expect(step.start).toBeGreaterThanOrEqual((steps[index] as { start: number }).start);
    });
  });

  it('handles empty text', () => {
    expect(slidingWindowSteps('')).toEqual([]);
  });
});

describe('slowestSelfTime', () => {
  it('finds where time goes, ignoring time spent waiting on nested calls', () => {
    expect(slowestSelfTime(TRACE_SPANS).service).toBe('Database');
  });
});
