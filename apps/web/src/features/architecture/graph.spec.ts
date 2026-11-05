import { ARCHITECTURE_EDGES, ARCHITECTURE_NODES, chooseHandles, connectedLabels } from './graph';

describe('architecture graph', () => {
  const ids = ARCHITECTURE_NODES.map((node) => node.id);

  it('has unique ids', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only connects nodes that exist', () => {
    for (const { source, target } of ARCHITECTURE_EDGES) {
      expect(ids).toContain(source);
      expect(ids).toContain(target);
    }
  });

  it('leaves from the side facing the target', () => {
    expect(chooseHandles({ x: 0, y: 0 }, { x: 200, y: 50 })).toEqual({
      sourceHandle: 'right',
      targetHandle: 'left',
    });
    expect(chooseHandles({ x: 0, y: 0 }, { x: 10, y: 200 })).toEqual({
      sourceHandle: 'bottom',
      targetHandle: 'top',
    });
    expect(chooseHandles({ x: 0, y: 200 }, { x: -100, y: 0 })).toEqual({
      sourceHandle: 'top',
      targetHandle: 'bottom',
    });
  });

  it('leaves no node unconnected', () => {
    for (const id of ids) expect(connectedLabels(id).length).toBeGreaterThan(0);
  });
});
