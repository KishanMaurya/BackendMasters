import { Bar, Box, Frame, Wire, type IllustrationProps } from './primitives';

function UmlClass({
  x,
  y,
  name,
  accent,
  delay = 0,
}: {
  x: number;
  y: number;
  name: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <g>
      <Box x={x} y={y} w={60} h={40} rx={3} accent={accent} />
      <text
        x={x + 30}
        y={y + 8}
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={7}
        className="fill-foreground font-mono"
      >
        {name}
      </text>
      <path
        d={`M${x} ${y + 15}h60`}
        className={accent ? 'stroke-brand-signal' : 'stroke-foreground/30'}
      />
      <Bar x={x + 6} y={y + 21} w={36} h={3} delay={delay} />
      <Bar x={x + 6} y={y + 29} w={26} h={3} delay={delay + 0.1} />
    </g>
  );
}

/** A UML class diagram: one interface and two implementations. */
export function LldIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <Wire draw delay={0.2} dashed={false} d="M40 74V62H120V74M80 52V62" />
      <path d="M80 48l-4 6h8Z" className="fill-muted stroke-foreground/50" />
      <UmlClass x={50} y={8} name="Payment" accent />
      <UmlClass x={10} y={74} name="Card" delay={0.3} />
      <UmlClass x={90} y={74} name="UPI" delay={0.45} />
    </Frame>
  );
}
