'use client';

import { useMemo, useState } from 'react';
import { buttonVariants } from '@/components/ui/button-variants';
import { Explainer } from './explainer';
import { Scene, SceneLine, SceneNode, ScenePacket } from './scene-parts';
import {
  initialConnections,
  SERVER_NAMES,
  simulateBalancing,
  type BalancingAlgorithm,
} from './scenes';

const ALGORITHMS: { value: BalancingAlgorithm; label: string }[] = [
  { value: 'round-robin', label: 'Round robin' },
  { value: 'least-connections', label: 'Least connections' },
];
const SERVER_Y = [12, 72, 132];
const SERVER_X = 310;

export default function LoadBalancerExplainer() {
  const [algorithm, setAlgorithm] = useState<BalancingAlgorithm>('round-robin');
  const steps = useMemo(() => simulateBalancing(algorithm), [algorithm]);
  const captions = useMemo(
    () => [
      'Server A is already busy with 4 open connections. Six requests are about to arrive.',
      ...steps.map(({ request, server, connections }) => {
        const reason =
          algorithm === 'round-robin'
            ? 'it is next in the rotation, whatever its load'
            : 'it has the fewest open connections';
        return `Request ${request} goes to ${SERVER_NAMES[server]}, because ${reason}. It now has ${connections[server]}.`;
      }),
    ],
    [steps, algorithm],
  );

  return (
    <Explainer
      title="Load balancer"
      captions={captions}
      options={
        <div role="group" aria-label="Balancing algorithm" className="flex gap-1">
          {ALGORITHMS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={algorithm === value}
              onClick={() => setAlgorithm(value)}
              className={buttonVariants({
                variant: algorithm === value ? 'secondary' : 'ghost',
                size: 'sm',
              })}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      {(step) => {
        const current = step > 0 ? steps[step - 1] : undefined;
        const connections = current?.connections ?? initialConnections();
        return (
          <Scene height={184}>
            <SceneNode x={6} y={72} width={72} label="Clients" />
            <SceneNode x={150} y={72} width={92} label="Load balancer" active={Boolean(current)} />
            <SceneLine from={[78, 92]} to={[150, 92]} active={Boolean(current)} />
            {SERVER_NAMES.map((name, index) => (
              <g key={name}>
                <SceneLine
                  from={[242, 92]}
                  to={[SERVER_X, (SERVER_Y[index] as number) + 20]}
                  active={current?.server === index}
                />
                <SceneNode
                  x={SERVER_X}
                  y={SERVER_Y[index] as number}
                  width={104}
                  label={name}
                  detail={`${connections[index]} open`}
                  active={current?.server === index}
                />
              </g>
            ))}
            <ScenePacket
              x={current ? SERVER_X - 8 : 78}
              y={current ? (SERVER_Y[current.server] as number) + 20 : 92}
              visible={Boolean(current)}
            />
          </Scene>
        );
      }}
    </Explainer>
  );
}
