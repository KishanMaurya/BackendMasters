import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface IllustrationProps {
  /** Accessible description. Omit when the illustration is decorative. */
  title?: string;
  /** Animate continuously, rather than only while a parent `.group` is hovered. */
  live?: boolean;
  className?: string;
}

const motionVars = (delay = 0, cycle?: number): CSSProperties =>
  ({
    '--bm-delay': `${delay}s`,
    ...(cycle ? { '--bm-cycle': `${cycle}s` } : {}),
  }) as CSSProperties;

export function Frame({
  title,
  live,
  className,
  viewBox = '0 0 160 120',
  children,
}: IllustrationProps & { viewBox?: string; children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      className={cn(live && 'bm-live', className ?? 'h-auto w-full')}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      {children}
    </svg>
  );
}

export function Box({
  x,
  y,
  w,
  h,
  label,
  accent,
  size = 7,
  rx = 4,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  accent?: boolean;
  size?: number;
  rx?: number;
}) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        className={cn('fill-muted', accent ? 'stroke-brand-signal' : 'stroke-foreground/30')}
      />
      {label && (
        <text
          x={x + w / 2}
          y={y + h / 2}
          dominantBaseline="central"
          textAnchor="middle"
          fontSize={size}
          className="fill-foreground font-mono"
        >
          {label}
        </text>
      )}
    </>
  );
}

export function Wire({
  d,
  dashed,
  draw,
  delay,
}: {
  d: string;
  dashed?: boolean;
  draw?: boolean;
  delay?: number;
}) {
  return (
    <path
      d={d}
      pathLength={draw ? 100 : undefined}
      strokeDasharray={dashed ? '3 3' : undefined}
      className={cn('stroke-foreground/30', draw && 'bm-draw')}
      style={draw ? motionVars(delay) : undefined}
    />
  );
}

/** A dash travelling along `d`. Hidden at rest. */
export function Packet({
  d,
  delay = 0,
  cycle,
  width = 3,
  hero,
}: {
  d: string;
  delay?: number;
  cycle?: number;
  width?: number;
  hero?: boolean;
}) {
  return (
    <path
      d={d}
      pathLength={100}
      strokeWidth={width}
      className={cn('bm-packet', hero && 'bm-packet-hero')}
      style={motionVars(delay, cycle)}
    />
  );
}

/** A highlight shown as a packet arrives at a node. */
export function Flash({
  x,
  y,
  w,
  h,
  delay,
  cycle = 9,
  rx = 8,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  cycle?: number;
  rx?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      strokeWidth={1.5}
      className="bm-flash stroke-brand-signal"
      style={motionVars(delay, cycle)}
    />
  );
}

export function Cylinder({
  x,
  y,
  w,
  h,
  label,
  accent,
  size = 7,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  accent?: boolean;
  size?: number;
}) {
  const ry = Math.max(3, w * 0.14);
  const rx = w / 2;
  return (
    <>
      <path
        d={`M${x} ${y + ry}a${rx} ${ry} 0 0 1 ${w} 0v${h - 2 * ry}a${rx} ${ry} 0 0 1 -${w} 0Z`}
        className={cn('fill-muted', accent ? 'stroke-brand-signal' : 'stroke-foreground/30')}
      />
      <path
        d={`M${x} ${y + ry}a${rx} ${ry} 0 0 0 ${w} 0`}
        className={accent ? 'stroke-brand-signal' : 'stroke-foreground/30'}
      />
      {label && (
        <text
          x={x + rx}
          y={y + h / 2 + ry / 2}
          dominantBaseline="central"
          textAnchor="middle"
          fontSize={size}
          className="fill-foreground font-mono"
        >
          {label}
        </text>
      )}
    </>
  );
}

export function Bar({
  x,
  y,
  w,
  h = 4,
  delay,
  accent,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={h / 2}
      className={cn('bm-grow', accent ? 'fill-brand-signal' : 'fill-foreground/25')}
      style={motionVars(delay)}
    />
  );
}
