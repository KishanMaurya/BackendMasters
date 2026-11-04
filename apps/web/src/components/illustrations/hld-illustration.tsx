import { Box, Frame, Packet, Wire, type IllustrationProps } from './primitives';

const PATHS = ['M58 60C76 60 76 22 96 22', 'M58 60H96', 'M58 60C76 60 76 98 96 98'];

/** A load balancer distributing requests across three servers, round robin. */
export function HldIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <Wire d="M6 60H26" />
      {PATHS.map((d) => (
        <Wire key={d} d={d} />
      ))}
      <Packet d="M6 60H26" delay={0} cycle={4} />
      {PATHS.map((d, index) => (
        <Packet key={d} d={d} delay={0.2 + index * 1.3} cycle={4} />
      ))}
      <Box x={26} y={46} w={32} h={28} label="LB" accent />
      <Box x={96} y={10} w={56} h={24} label="server 1" />
      <Box x={96} y={48} w={56} h={24} label="server 2" />
      <Box x={96} y={86} w={56} h={24} label="server 3" />
    </Frame>
  );
}
