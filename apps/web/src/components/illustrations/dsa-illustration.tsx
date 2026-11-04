import type { CSSProperties } from 'react';
import { Frame, Wire, type IllustrationProps } from './primitives';

const NODES = [
  { x: 80, y: 20, v: 8 },
  { x: 42, y: 58, v: 4 },
  { x: 20, y: 98, v: 2 },
  { x: 62, y: 98, v: 6 },
  { x: 118, y: 58, v: 12 },
  { x: 98, y: 98, v: 10 },
  { x: 140, y: 98, v: 14 },
];

/** A binary search tree, with a pre-order traversal moving node to node. */
export function DsaIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <Wire d="M80 20L42 58M80 20L118 58M42 58L20 98M42 58L62 98M118 58L98 98M118 58L140 98" />
      {NODES.map((node, index) => (
        <g key={node.v}>
          <circle
            cx={node.x}
            cy={node.y}
            r={12}
            className={
              index === 0 ? 'fill-muted stroke-brand-signal' : 'fill-muted stroke-foreground/30'
            }
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={12}
            strokeWidth={2}
            className="bm-step stroke-brand-signal"
            style={{ '--bm-delay': `${index * 0.45}s` } as CSSProperties}
          />
          <text
            x={node.x}
            y={node.y}
            dominantBaseline="central"
            textAnchor="middle"
            fontSize={9}
            className="fill-foreground font-mono"
          >
            {node.v}
          </text>
        </g>
      ))}
    </Frame>
  );
}
