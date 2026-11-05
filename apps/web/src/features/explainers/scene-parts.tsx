import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const SCENE_WIDTH = 420;

export function Scene({ height, children }: { height: number; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${SCENE_WIDTH} ${height}`} fill="none" aria-hidden className="h-auto w-full">
      {children}
    </svg>
  );
}

export function SceneNode({
  x,
  y,
  width = 92,
  height = 40,
  label,
  detail,
  active,
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  detail?: string;
  active?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        strokeWidth={1.5}
        className={cn(
          'bm-scene-fade',
          active ? 'fill-accent stroke-primary' : 'fill-background stroke-border',
        )}
      />
      <text
        x={x + width / 2}
        y={detail ? y + height / 2 - 3 : y + height / 2 + 4}
        textAnchor="middle"
        className="fill-foreground font-sans text-[12px] font-medium"
      >
        {label}
      </text>
      {detail && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 11}
          textAnchor="middle"
          className="fill-muted-foreground font-mono text-[10px]"
        >
          {detail}
        </text>
      )}
    </g>
  );
}

export function SceneLine({
  from,
  to,
  active,
}: {
  from: [number, number];
  to: [number, number];
  active?: boolean;
}) {
  return (
    <line
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      strokeWidth={active ? 2 : 1.25}
      className={cn('bm-scene-fade', active ? 'stroke-primary' : 'stroke-border')}
    />
  );
}

/** A moving packet. It moves with a transform, and motion.css animates that when motion is on. */
export function ScenePacket({ x, y, visible = true }: { x: number; y: number; visible?: boolean }) {
  return (
    <circle
      r={5}
      cx={0}
      cy={0}
      className="bm-scene-packet fill-primary"
      style={{ transform: `translate(${x}px, ${y}px)`, opacity: visible ? 1 : 0 }}
    />
  );
}
