import { Bar, Frame, type IllustrationProps } from './primitives';

/** A question card with its answer written out in code. */
export function InterviewIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <rect
        x={8}
        y={10}
        width={100}
        height={46}
        rx={5}
        className="fill-muted stroke-foreground/30"
      />
      <text x={18} y={26} fontSize={11} className="fill-foreground font-mono">
        Q
      </text>
      <Bar x={32} y={20} w={62} />
      <Bar x={32} y={30} w={44} />
      <Bar x={18} y={42} w={78} />
      <rect
        x={42}
        y={46}
        width={110}
        height={66}
        rx={5}
        className="fill-muted stroke-brand-signal"
      />
      <text x={52} y={63} fontSize={11} className="fill-brand-signal font-mono">
        A
      </text>
      <Bar x={66} y={57} w={70} delay={0.1} accent />
      <Bar x={66} y={68} w={52} delay={0.25} />
      <Bar x={74} y={79} w={60} delay={0.4} />
      <Bar x={74} y={90} w={38} delay={0.55} />
      <Bar x={66} y={101} w={20} delay={0.7} />
    </Frame>
  );
}
