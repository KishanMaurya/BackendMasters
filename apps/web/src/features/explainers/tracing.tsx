'use client';

import { Explainer } from './explainer';
import { Scene } from './scene-parts';
import { slowestSelfTime, TRACE_SPANS } from './scenes';

const LABEL_WIDTH = 96;
const TRACK_WIDTH = 300;
const ROW_HEIGHT = 30;
const TOTAL_MS = TRACE_SPANS[0]?.durationMs ?? 1;
const SLOWEST = slowestSelfTime(TRACE_SPANS);

const CAPTIONS = [
  'A request enters the API gateway, which starts a trace and passes its ID in a header.',
  'Orders joins the same trace. Its span is nested inside the gateway’s.',
  'Inventory answers quickly, in 30 ms.',
  'Payments is called next, and most of the wait starts here.',
  `The waterfall shows it at a glance: ${SLOWEST.service} takes ${SLOWEST.durationMs} ms of the ${TOTAL_MS} ms total. That is where to look first.`,
];

export default function TracingExplainer() {
  return (
    <Explainer title="Distributed trace" captions={CAPTIONS}>
      {(step) => (
        <Scene height={TRACE_SPANS.length * ROW_HEIGHT + 22}>
          {TRACE_SPANS.map((span, index) => {
            const y = index * ROW_HEIGHT;
            const visible = index <= step;
            const x = LABEL_WIDTH + (span.startMs / TOTAL_MS) * TRACK_WIDTH;
            const width = Math.max(14, (span.durationMs / TOTAL_MS) * TRACK_WIDTH);
            const newest = index === step;
            return (
              <g
                key={span.service}
                className="bm-scene-fade"
                style={{ opacity: visible ? 1 : 0.25 }}
              >
                <text x={0} y={y + 18} className="fill-foreground font-sans text-[11px]">
                  {span.service}
                </text>
                <rect
                  x={x}
                  y={y + 5}
                  width={width}
                  height={18}
                  rx={4}
                  className={newest ? 'fill-primary' : 'fill-muted-foreground/40'}
                />
                {visible && (
                  <text
                    x={x + width - 4}
                    y={y + 18}
                    textAnchor="end"
                    className={
                      newest
                        ? 'fill-primary-foreground font-mono text-[10px]'
                        : 'fill-foreground font-mono text-[10px]'
                    }
                  >
                    {span.durationMs} ms
                  </text>
                )}
              </g>
            );
          })}
          <line
            x1={LABEL_WIDTH}
            x2={LABEL_WIDTH + TRACK_WIDTH}
            y1={TRACE_SPANS.length * ROW_HEIGHT + 4}
            y2={TRACE_SPANS.length * ROW_HEIGHT + 4}
            className="stroke-border"
          />
          <text
            x={LABEL_WIDTH}
            y={TRACE_SPANS.length * ROW_HEIGHT + 18}
            className="fill-muted-foreground font-mono text-[10px]"
          >
            0 ms
          </text>
          <text
            x={LABEL_WIDTH + TRACK_WIDTH}
            y={TRACE_SPANS.length * ROW_HEIGHT + 18}
            textAnchor="end"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            {TOTAL_MS} ms
          </text>
        </Scene>
      )}
    </Explainer>
  );
}
