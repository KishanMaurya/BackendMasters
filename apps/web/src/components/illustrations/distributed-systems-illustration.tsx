import { Frame, Packet, Wire, type IllustrationProps } from './primitives';

const NODES = [
  [80, 14],
  [132, 42],
  [132, 88],
  [80, 108],
  [28, 88],
  [28, 42],
] as const;
const point = (index: number) => NODES[index % NODES.length] as readonly [number, number];
const link = (a: number, b: number) =>
  `M${point(a)[0]} ${point(a)[1]}L${point(b)[0]} ${point(b)[1]}`;
const RING = NODES.map((_, index) => link(index, index + 1));
const CROSS = [link(0, 3), link(1, 4), link(2, 5)];

/** A cluster of nodes in a ring, passing messages between peers. */
export function DistributedSystemsIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {RING.map((d) => (
        <Wire key={d} d={d} />
      ))}
      {CROSS.map((d) => (
        <Wire key={d} d={d} dashed />
      ))}
      {RING.map((d, index) => (
        <Packet key={d} d={d} delay={index * 0.6} cycle={3.6} />
      ))}
      {NODES.map(([cx, cy], index) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={9}
          className={
            index === 0 ? 'fill-muted stroke-brand-signal' : 'fill-muted stroke-foreground/30'
          }
        />
      ))}
    </Frame>
  );
}
