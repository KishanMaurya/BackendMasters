'use client';

import { Explainer } from './explainer';
import { Scene, SceneLine, SceneNode } from './scene-parts';
import { assignShards, movedKeys, SHARD_USER_IDS } from './scenes';

const SHARDS = 3;
const RECORDS = assignShards(SHARD_USER_IDS, SHARDS);
const MOVED = movedKeys(SHARD_USER_IDS, SHARDS, SHARDS + 1);
const SHARD_X = [8, 148, 288];

const CAPTIONS = [
  'Each record goes to one shard, chosen from its key: user_id % 3.',
  ...RECORDS.map(
    ({ userId, shard }) =>
      `User ${userId}: ${userId} % ${SHARDS} = ${shard}, so it goes to shard ${shard}.`,
  ),
  `Reads for one user touch one shard. But adding a fourth shard would move ${MOVED} of these ${RECORDS.length} keys, which is why real systems use consistent hashing.`,
];

export default function ShardingExplainer() {
  return (
    <Explainer title="Database sharding" captions={CAPTIONS}>
      {(step) => {
        const placed = RECORDS.slice(0, step);
        const latest = step > 0 && step <= RECORDS.length ? RECORDS[step - 1] : undefined;
        return (
          <Scene height={216}>
            <SceneNode
              x={150}
              y={6}
              width={120}
              label="hash(user_id)"
              detail={latest ? `${latest.userId} → ${latest.shard}` : '% 3'}
              active={Boolean(latest)}
            />
            {SHARD_X.map((x, shard) => {
              const records = placed.filter((record) => record.shard === shard);
              return (
                <g key={shard}>
                  <SceneLine from={[210, 46]} to={[x + 62, 70]} active={latest?.shard === shard} />
                  <SceneNode
                    x={x}
                    y={70}
                    width={124}
                    height={30}
                    label={`Shard ${shard}`}
                    active={latest?.shard === shard}
                  />
                  {records.map((record, index) => (
                    <text
                      key={record.userId}
                      x={x + 62}
                      y={120 + index * 18}
                      textAnchor="middle"
                      className="bm-scene-fade fill-foreground font-mono text-[11px]"
                    >
                      user {record.userId}
                    </text>
                  ))}
                </g>
              );
            })}
          </Scene>
        );
      }}
    </Explainer>
  );
}
