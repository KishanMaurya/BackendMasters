'use client';

import { Explainer } from './explainer';
import { Scene, SceneLine, SceneNode, ScenePacket } from './scene-parts';

type Spot = 'client' | 'app' | 'cache' | 'database';

const SPOTS: Record<Spot, [number, number]> = {
  client: [44, 80],
  app: [176, 80],
  cache: [340, 28],
  database: [340, 132],
};

const FRAMES: { spot: Spot; caption: string; cached: boolean; result?: 'miss' | 'hit' }[] = [
  { spot: 'client', cached: false, caption: 'A client asks for product 42.' },
  { spot: 'app', cached: false, caption: 'The request reaches the application.' },
  {
    spot: 'cache',
    cached: false,
    result: 'miss',
    caption: 'Cache miss: Redis has no entry for this key.',
  },
  {
    spot: 'database',
    cached: false,
    caption: 'The application reads the database. This is the slow part, about 40 ms.',
  },
  {
    spot: 'cache',
    cached: true,
    caption: 'It stores the result in Redis with an expiry, so the next read is fast.',
  },
  { spot: 'client', cached: true, caption: 'The client gets its response, after the slower path.' },
  { spot: 'app', cached: true, caption: 'A second client asks for product 42.' },
  {
    spot: 'cache',
    cached: true,
    result: 'hit',
    caption: 'Cache hit: Redis answers in about 1 ms, and the database is never touched.',
  },
  {
    spot: 'client',
    cached: true,
    caption:
      'If this popular key expired, every waiting request would miss at once. That is a cache stampede.',
  },
];

export default function CachingExplainer() {
  return (
    <Explainer title="Cache hit and miss" captions={FRAMES.map((frame) => frame.caption)}>
      {(step) => {
        const frame = FRAMES[step] ?? FRAMES[0]!;
        const [x, y] = SPOTS[frame.spot];
        return (
          <Scene height={164}>
            <SceneLine from={[84, 80]} to={[136, 80]} active={frame.spot === 'app'} />
            <SceneLine from={[216, 70]} to={[290, 34]} active={frame.spot === 'cache'} />
            <SceneLine from={[216, 90]} to={[290, 128]} active={frame.spot === 'database'} />
            <SceneNode x={4} y={60} width={80} label="Client" active={frame.spot === 'client'} />
            <SceneNode
              x={136}
              y={60}
              width={80}
              label="Application"
              active={frame.spot === 'app'}
            />
            <SceneNode
              x={290}
              y={8}
              width={124}
              label="Redis"
              detail={
                frame.result === 'miss'
                  ? 'miss'
                  : frame.result === 'hit'
                    ? 'hit'
                    : frame.cached
                      ? 'product:42 stored'
                      : 'empty'
              }
              active={frame.spot === 'cache'}
            />
            <SceneNode
              x={290}
              y={112}
              width={124}
              label="Database"
              detail="source of truth"
              active={frame.spot === 'database'}
            />
            <ScenePacket
              x={x}
              y={y + (frame.spot === 'cache' || frame.spot === 'database' ? 34 : 24)}
            />
          </Scene>
        );
      }}
    </Explainer>
  );
}
