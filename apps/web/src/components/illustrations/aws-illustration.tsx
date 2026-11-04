import { Box, Frame, Packet, Wire, type IllustrationProps } from './primitives';

const CLOUD = 'M34 104a23 23 0 0 1 -3 -46a34 34 0 0 1 64 -18a27 27 0 0 1 38 20a23 23 0 0 1 -5 44Z';

/** A request routed through a cloud boundary to compute, storage and a queue. */
export function AwsIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <path d={CLOUD} strokeDasharray="3 3" className="stroke-foreground/40" />
      <Wire d="M2 80H22M50 80H68M92 72L106 58M92 88L106 96" />
      <Packet d="M2 80H22" delay={0} cycle={3.6} />
      <Packet d="M50 80H68" delay={0.6} cycle={3.6} />
      <Packet d="M92 72L106 58" delay={1.3} cycle={3.6} />
      <Packet d="M92 88L106 96" delay={2.2} cycle={3.6} />
      <Box x={22} y={68} w={28} h={24} label="API" size={6.5} />
      <Box x={68} y={66} w={24} h={28} label="λ" accent size={11} />
      <Box x={106} y={46} w={26} h={20} label="S3" size={6.5} />
      <Box x={106} y={84} w={26} h={18} label="SQS" size={6.5} />
    </Frame>
  );
}
