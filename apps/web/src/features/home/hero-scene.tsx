import { Box, Cylinder, Flash, Frame, Packet, Wire } from '@/components/illustrations/primitives';

/*
 * Three requests share one 9s timeline, each hop taking 0.9s:
 * 0s reaches "articles" and hits the cache, 3s reaches "search" and queries the database,
 * 6s reaches "auth" and publishes to the queue. The balancer takes them in turn.
 */
const HOPS = {
  clientGateway: 'M92 260H136',
  gatewayBalancer: 'M232 260H270',
  balancerA: 'M366 260C388 260 386 130 410 130',
  balancerB: 'M366 260H410',
  balancerC: 'M366 260C388 260 386 390 410 390',
  aCache: 'M500 130H540',
  bDatabase: 'M500 260H540',
  aDatabase: 'M500 142C522 150 520 232 548 240',
  cQueue: 'M500 390H540',
  queueWorker: 'M584 410V450',
};

const TIMELINE: readonly (readonly [string, number])[] = [
  [HOPS.clientGateway, 0],
  [HOPS.gatewayBalancer, 0.9],
  [HOPS.balancerA, 1.8],
  [HOPS.aCache, 2.7],
  [HOPS.clientGateway, 3],
  [HOPS.gatewayBalancer, 3.9],
  [HOPS.balancerB, 4.8],
  [HOPS.bDatabase, 5.7],
  [HOPS.clientGateway, 6],
  [HOPS.gatewayBalancer, 6.9],
  [HOPS.balancerC, 7.8],
  [HOPS.cQueue, 8.7],
  [HOPS.queueWorker, 0.6],
];

const DESCRIPTION =
  'Animated diagram of a distributed system. Requests pass from a client through an API gateway to a load balancer, which sends each one to a different service. The services use a cache, a database and a queue processed by a worker.';

export function HeroScene() {
  return (
    <Frame viewBox="0 0 640 520" title={DESCRIPTION} live>
      {Object.values(HOPS).map((d) => (
        <Wire key={d} d={d} />
      ))}
      {TIMELINE.map(([d, delay]) => (
        <Packet key={`${d}-${delay}`} d={d} delay={delay} cycle={9} hero width={4} />
      ))}

      <Box x={8} y={240} w={84} h={40} label="client" size={12} rx={8} />
      <Box x={136} y={240} w={96} h={40} label="gateway" size={12} rx={8} />
      <Box x={270} y={240} w={96} h={40} label="balancer" size={12} rx={8} accent />
      <Box x={410} y={110} w={90} h={40} label="articles" size={12} rx={8} />
      <Box x={410} y={240} w={90} h={40} label="search" size={12} rx={8} />
      <Box x={410} y={370} w={90} h={40} label="auth" size={12} rx={8} />
      <Box x={540} y={110} w={90} h={40} label="cache" size={12} rx={8} />
      <Cylinder x={540} y={228} w={90} h={64} label="database" size={12} />
      <Box x={540} y={370} w={90} h={40} label="queue" size={12} rx={8} />
      <Box x={540} y={450} w={90} h={40} label="worker" size={12} rx={8} />

      <Flash x={410} y={110} w={90} h={40} delay={2.7} />
      <Flash x={410} y={240} w={90} h={40} delay={5.7} />
      <Flash x={410} y={370} w={90} h={40} delay={8.7} />
      <Flash x={540} y={110} w={90} h={40} delay={3.6} />
      <Flash x={540} y={370} w={90} h={40} delay={0.6} />
      <Flash x={540} y={450} w={90} h={40} delay={1.5} />
    </Frame>
  );
}

const COMPACT = {
  a: 'M94 110C114 110 112 40 134 40',
  b: 'M94 110H134',
  c: 'M94 110C114 110 112 180 134 180',
  db: 'M216 110H254',
  dbA: 'M216 40C238 40 236 100 254 104',
  dbC: 'M216 180C238 180 236 120 254 116',
};

/** A simpler version for small screens, where the full scene's labels would be too small to read. */
export function HeroSceneCompact() {
  return (
    <Frame
      viewBox="0 0 340 220"
      title="Animated diagram of a load balancer sending requests to three services that share a database."
      live
    >
      {Object.values(COMPACT).map((d) => (
        <Wire key={d} d={d} />
      ))}
      <Packet d={COMPACT.a} delay={0} cycle={6} hero width={3.5} />
      <Packet d={COMPACT.dbA} delay={0.6} cycle={6} hero width={3.5} />
      <Packet d={COMPACT.b} delay={2} cycle={6} hero width={3.5} />
      <Packet d={COMPACT.db} delay={2.6} cycle={6} hero width={3.5} />
      <Packet d={COMPACT.c} delay={4} cycle={6} hero width={3.5} />
      <Packet d={COMPACT.dbC} delay={4.6} cycle={6} hero width={3.5} />
      <Box x={6} y={90} w={88} h={40} label="balancer" size={12} rx={8} accent />
      <Box x={134} y={20} w={82} h={40} label="articles" size={12} rx={8} />
      <Box x={134} y={90} w={82} h={40} label="search" size={12} rx={8} />
      <Box x={134} y={160} w={82} h={40} label="auth" size={12} rx={8} />
      <Cylinder x={254} y={78} w={80} h={64} label="db" size={12} />
    </Frame>
  );
}
