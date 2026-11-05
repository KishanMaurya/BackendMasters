'use client';

import { cn } from '@/lib/utils';
import { Explainer } from './explainer';
import { Scene } from './scene-parts';
import { slidingWindowSteps } from './scenes';

const TEXT = 'abcabcbb';
const STEPS = slidingWindowSteps(TEXT);
const CELL = 46;
const LEFT = (420 - TEXT.length * CELL) / 2;

const CAPTIONS = [
  `Find the longest run of "${TEXT}" with no repeated character. The window starts empty.`,
  ...STEPS.map((step) => step.caption),
  `Done. Each character is visited once, so this takes O(n) time. The answer is ${STEPS.at(-1)?.longest}.`,
];

export default function SlidingWindowExplainer() {
  return (
    <Explainer title="Sliding window" captions={CAPTIONS}>
      {(step) => {
        const frame = step > 0 ? (STEPS[step - 1] ?? STEPS.at(-1)) : undefined;
        return (
          <Scene height={108}>
            {[...TEXT].map((char, index) => {
              const inWindow = frame && index >= frame.start && index <= frame.end;
              return (
                <g key={index}>
                  <rect
                    x={LEFT + index * CELL + 2}
                    y={12}
                    width={CELL - 4}
                    height={46}
                    rx={6}
                    strokeWidth={1.5}
                    className={cn(
                      'bm-scene-fade',
                      inWindow ? 'fill-accent stroke-primary' : 'fill-background stroke-border',
                    )}
                  />
                  <text
                    x={LEFT + index * CELL + CELL / 2}
                    y={41}
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[16px]"
                  >
                    {char}
                  </text>
                  <text
                    x={LEFT + index * CELL + CELL / 2}
                    y={74}
                    textAnchor="middle"
                    className="fill-muted-foreground font-mono text-[10px]"
                  >
                    {index}
                  </text>
                </g>
              );
            })}
            <text
              x={210}
              y={98}
              textAnchor="middle"
              className="fill-foreground font-mono text-[12px]"
            >
              {frame
                ? `start = ${frame.start}   end = ${frame.end}   longest = ${frame.longest}`
                : 'start = 0   longest = 0'}
            </text>
          </Scene>
        );
      }}
    </Explainer>
  );
}
