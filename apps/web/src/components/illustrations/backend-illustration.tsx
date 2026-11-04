import { Box, Cylinder, Frame, Packet, Wire, type IllustrationProps } from './primitives';

const ROUTE = 'M80 2V92';

/** A request moving through the layers of a backend service. */
export function BackendIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <Wire d={ROUTE} />
      <Packet d={ROUTE} cycle={3} delay={0} />
      <Box x={32} y={10} w={96} h={18} label="middleware" />
      <Box x={32} y={34} w={96} h={18} label="validation" />
      <Box x={32} y={58} w={96} h={18} label="service" accent />
      <Cylinder x={58} y={86} w={44} h={30} label="db" />
    </Frame>
  );
}
