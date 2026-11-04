import { Cylinder, Frame, Packet, Wire, type IllustrationProps } from './primitives';

const LEFT = 'M60 34C42 34 34 44 34 66';
const RIGHT = 'M100 34C118 34 126 44 126 66';

/** A primary database replicating writes to two replicas. */
export function DatabaseIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <Wire d={LEFT} />
      <Wire d={RIGHT} />
      <Packet d={LEFT} delay={0} cycle={2.8} />
      <Packet d={RIGHT} delay={0.4} cycle={2.8} />
      <Cylinder x={56} y={8} w={48} h={48} label="primary" accent size={6.5} />
      <Cylinder x={12} y={66} w={44} h={44} label="replica" size={6.5} />
      <Cylinder x={104} y={66} w={44} h={44} label="replica" size={6.5} />
    </Frame>
  );
}
