import { Box, Frame, Packet, Wire, type IllustrationProps } from './primitives';

const IN = ['M34 34C44 34 44 34 52 34', 'M34 86C44 86 44 60 52 60'];
const OUT = ['M118 34C124 34 124 34 130 34', 'M118 60C124 60 124 86 130 86'];

function Partition({ y }: { y: number }) {
  return (
    <g>
      <rect
        x={52}
        y={y}
        width={66}
        height={16}
        rx={2}
        className="fill-muted stroke-foreground/30"
      />
      {[0, 1, 2, 3].map((index) => (
        <rect
          key={index}
          x={56 + index * 15}
          y={y + 4}
          width={11}
          height={8}
          rx={1}
          className={index === 3 ? 'fill-brand-signal' : 'fill-foreground/25'}
        />
      ))}
    </g>
  );
}

/** Producers writing to partitions of a topic, read by a consumer group. */
export function KafkaIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {[...IN, ...OUT].map((d) => (
        <Wire key={d} d={d} />
      ))}
      {IN.map((d, index) => (
        <Packet key={d} d={d} delay={index * 1.2} cycle={3.2} />
      ))}
      {OUT.map((d, index) => (
        <Packet key={d} d={d} delay={0.8 + index * 1.2} cycle={3.2} />
      ))}
      <Partition y={26} />
      <Partition y={52} />
      <Partition y={78} />
      <Box x={4} y={22} w={30} h={24} label="prod" size={6.5} />
      <Box x={4} y={74} w={30} h={24} label="prod" size={6.5} />
      <Box x={130} y={22} w={28} h={24} label="cons" size={6.5} accent />
      <Box x={130} y={74} w={28} h={24} label="cons" size={6.5} accent />
    </Frame>
  );
}
