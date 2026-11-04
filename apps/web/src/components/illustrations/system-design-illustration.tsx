import { Box, Frame, Packet, Wire, type IllustrationProps } from './primitives';

const LINKS = [
  { d: 'M80 60L34 24', delay: 0 },
  { d: 'M80 60L126 24', delay: 0.7 },
  { d: 'M80 60L34 96', delay: 1.4 },
  { d: 'M80 60L126 96', delay: 2.1 },
];

/** Connected microservices exchanging messages through a gateway. */
export function SystemDesignIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      {LINKS.map(({ d }) => (
        <Wire key={d} d={d} />
      ))}
      <Wire dashed d="M34 34V86M126 34V86" />
      {LINKS.map(({ d, delay }) => (
        <Packet key={d} d={d} delay={delay} cycle={3} />
      ))}
      <Box x={8} y={12} w={52} h={24} label="users" />
      <Box x={100} y={12} w={52} h={24} label="orders" />
      <Box x={8} y={84} w={52} h={24} label="search" />
      <Box x={100} y={84} w={52} h={24} label="billing" />
      <Box x={56} y={46} w={48} h={28} label="gateway" accent size={6.5} />
    </Frame>
  );
}
