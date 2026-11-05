'use client';

import { cn } from '@/lib/utils';
import { Explainer } from './explainer';
import { Scene, SceneLine, SceneNode } from './scene-parts';
import { buildKafkaFrames } from './scenes';

const FRAMES = buildKafkaFrames();
const ROW_Y = [20, 92];
const CELL = 44;
const LOG_X = 118;

export default function KafkaExplainer() {
  return (
    <Explainer title="Kafka topic" captions={FRAMES.map((frame) => frame.caption)}>
      {(step) => {
        const frame = FRAMES[step] ?? FRAMES[0]!;
        return (
          <Scene height={150}>
            <SceneNode
              x={4}
              y={55}
              width={76}
              label="Producer"
              active={frame.active?.kind === 'produce'}
            />
            {ROW_Y.map((y, partition) => {
              const log = frame.logs[partition] ?? [];
              const offset = frame.offsets[partition] ?? 0;
              const active = frame.active?.partition === partition;
              return (
                <g key={partition}>
                  <SceneLine
                    from={[80, 75]}
                    to={[LOG_X, y + 18]}
                    active={active && frame.active?.kind === 'produce'}
                  />
                  <text x={LOG_X} y={y - 5} className="fill-muted-foreground font-mono text-[10px]">
                    partition {partition}
                  </text>
                  {Array.from({ length: 4 }, (_, index) => {
                    const message = log[index];
                    return (
                      <g key={index}>
                        <rect
                          x={LOG_X + index * CELL}
                          y={y}
                          width={CELL - 3}
                          height={36}
                          rx={5}
                          strokeWidth={1.25}
                          className={cn(
                            'bm-scene-fade',
                            !message && 'fill-background stroke-border',
                            message && index < offset && 'fill-muted stroke-border',
                            message && index >= offset && 'fill-accent stroke-primary',
                          )}
                        />
                        {message && (
                          <text
                            x={LOG_X + index * CELL + (CELL - 3) / 2}
                            y={y + 22}
                            textAnchor="middle"
                            className="fill-foreground font-mono text-[10px]"
                          >
                            {message.key.replace('user-', 'u')}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  <SceneLine
                    from={[LOG_X + 4 * CELL, y + 18]}
                    to={[LOG_X + 4 * CELL + 16, y + 18]}
                    active={active && frame.active?.kind === 'consume'}
                  />
                  <SceneNode
                    x={LOG_X + 4 * CELL + 16}
                    y={y}
                    width={90}
                    height={36}
                    label={`Consumer ${partition === 0 ? 'A' : 'B'}`}
                    detail={`offset ${offset}`}
                    active={active && frame.active?.kind === 'consume'}
                  />
                </g>
              );
            })}
          </Scene>
        );
      }}
    </Explainer>
  );
}
