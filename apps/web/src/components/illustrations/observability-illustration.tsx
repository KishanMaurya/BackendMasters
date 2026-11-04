import { Bar, Frame, Wire, type IllustrationProps } from './primitives';

/** A metrics chart above the spans of a distributed trace. */
export function ObservabilityIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect
        x={6}
        y={6}
        width={148}
        height={108}
        rx={6}
        className="fill-muted stroke-foreground/30"
      />
      <Wire dashed d="M16 26H144" />
      <path
        pathLength={100}
        d="M16 58L34 52L52 56L70 44L88 48L104 20L120 42L144 36"
        strokeWidth={1.75}
        strokeLinejoin="round"
        className="bm-draw stroke-brand-signal"
      />
      <path d="M12 68H148" className="stroke-foreground/15" />
      <Bar x={16} y={76} w={128} delay={0.1} accent />
      <Bar x={28} y={85} w={72} delay={0.25} />
      <Bar x={44} y={94} w={38} delay={0.4} />
      <Bar x={102} y={103} w={36} delay={0.55} />
    </Frame>
  );
}
