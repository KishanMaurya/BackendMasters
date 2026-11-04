import { Box, Frame, Packet, Wire, type IllustrationProps } from './primitives';

const REQUEST = 'M50 46H110';
const RESPONSE = 'M110 74H50';

/** A client sending a request and receiving a response. */
export function ApiIllustration(props: IllustrationProps) {
  return (
    <Frame {...props}>
      <Wire d={REQUEST} />
      <Wire d={RESPONSE} />
      <Packet d={REQUEST} delay={0} cycle={3} />
      <Packet d={RESPONSE} delay={1.1} cycle={3} />
      <text
        x={80}
        y={38}
        textAnchor="middle"
        fontSize={7}
        className="fill-muted-foreground font-mono"
      >
        GET /v1
      </text>
      <text x={80} y={88} textAnchor="middle" fontSize={7} className="fill-primary font-mono">
        200 OK
      </text>
      <Box x={8} y={34} w={42} h={52} label="client" />
      <Box x={110} y={34} w={42} h={52} label="API" accent />
    </Frame>
  );
}
