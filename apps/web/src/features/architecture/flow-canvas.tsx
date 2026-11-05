'use client';

import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Cloud,
  Database,
  FolderArchive,
  Globe,
  Laptop,
  ListOrdered,
  MemoryStick,
  Server,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import {
  ARCHITECTURE_EDGES,
  ARCHITECTURE_NODES,
  chooseHandles,
  connectedLabels,
  type ArchitectureNode,
  type NodeKind,
} from './graph';

const NARROW_QUERY = '(max-width: 639px)';
const ICONS: Record<NodeKind, LucideIcon> = {
  client: Laptop,
  edge: Globe,
  service: Server,
  cache: MemoryStick,
  database: Database,
  queue: ListOrdered,
  storage: FolderArchive,
};

type CanvasNode = Node<{ node: ArchitectureNode }, 'architecture'>;

function ArchitectureNodeView({ data, selected }: NodeProps<CanvasNode>) {
  const Icon = data.node.kind === 'edge' && data.node.id === 'cdn' ? Cloud : ICONS[data.node.kind];
  return (
    <div
      className={cn(
        'flex w-36 items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors duration-(--motion-fast)',
        selected ? 'border-primary' : 'border-border hover:border-foreground/30',
      )}
    >
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="opacity-0"
        isConnectable={false}
      />
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="opacity-0"
        isConnectable={false}
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className="opacity-0"
        isConnectable={false}
      />
      <Icon aria-hidden className="size-4 shrink-0 text-primary" />
      {data.node.label}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="opacity-0"
        isConnectable={false}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="opacity-0"
        isConnectable={false}
      />
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className="opacity-0"
        isConnectable={false}
      />
    </div>
  );
}

const NODE_TYPES = { architecture: ArchitectureNodeView };

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(NARROW_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** The site's theme is a class on the document, which React Flow can't see by itself. */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function useColorMode(): 'dark' | 'light' {
  return useSyncExternalStore(
    subscribeToTheme,
    () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'),
    () => 'dark',
  );
}

function buildNodes(narrow: boolean): CanvasNode[] {
  return ARCHITECTURE_NODES.map((node) => ({
    id: node.id,
    type: 'architecture',
    position: narrow ? node.narrow : node.wide,
    data: { node },
    ariaLabel: node.label,
  }));
}

function buildEdges(narrow: boolean): Edge[] {
  const positionOf = (id: string) => {
    const node = ARCHITECTURE_NODES.find((candidate) => candidate.id === id);
    if (!node) throw new Error(`Unknown node: ${id}`);
    return narrow ? node.narrow : node.wide;
  };
  return ARCHITECTURE_EDGES.map(({ source, target, label, async }) => ({
    id: `${source}-${target}`,
    source,
    target,
    ...chooseHandles(positionOf(source), positionOf(target)),
    animated: Boolean(async),
    // Labels crowd the small layout, and the details panel says the same thing.
    ...(label && !narrow ? { label } : {}),
  }));
}

function Canvas({ narrow }: { narrow: boolean }) {
  const initialNodes = useMemo(() => buildNodes(narrow), [narrow]);
  const initialEdges = useMemo(() => buildEdges(narrow), [narrow]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = ARCHITECTURE_NODES.find((node) => node.id === selectedId);
  const colorMode = useColorMode();

  const reset = useCallback(() => setNodes(buildNodes(narrow)), [narrow, setNodes]);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="bm-flow h-[30rem] overflow-hidden rounded-xl border bg-card">
        <ReactFlow
          colorMode={colorMode}
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          nodesConnectable={false}
          edgesFocusable={false}
          deleteKeyCode={null}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.3}
          maxZoom={1.5}
          // Lets the page keep scrolling over the canvas, on touch screens especially.
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch
          preventScrolling={false}
          aria-label="Architecture of an online store"
        >
          <Background gap={24} size={1} className="opacity-40" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <aside aria-live="polite" className="space-y-3 rounded-xl border bg-card p-4">
        {selected ? (
          <>
            <h3 className="font-heading text-lg font-medium">{selected.label}</h3>
            <p className="text-sm">{selected.summary}</p>
            <div>
              <h4 className="font-mono text-xs text-muted-foreground">When it fails</h4>
              <p className="mt-1 text-sm">{selected.whenItFails}</p>
            </div>
            <div>
              <h4 className="font-mono text-xs text-muted-foreground">Connects to</h4>
              <p className="mt-1 text-sm">{connectedLabels(selected.id).join(', ')}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a component to see what it does and what happens when it fails. Dashed lines are
            asynchronous.
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Reset layout
        </button>
      </aside>
    </div>
  );
}

export default function FlowCanvas() {
  const narrow = useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
  // Keyed, so crossing the breakpoint rebuilds the layout that suits the new width.
  return <Canvas key={String(narrow)} narrow={narrow} />;
}
