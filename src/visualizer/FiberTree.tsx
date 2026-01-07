import React, { useMemo, useEffect } from 'react';
import { ReactFlow, Background, MarkerType, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store';
import type { Fiber } from '../engine/types';
import { clsx } from 'clsx';

const NODE_WIDTH = 140;
const Y_GAP = 120;
const WIP_OFFSET_X = 500;

// Custom Node Component
const FiberNode = ({ data }: any) => {
  const { label, type, fiber, isActive } = data;
  const isWIP = type === 'wip';
  const isCurrent = type === 'current';

  return (
    <div
      className={clsx(
        "w-[140px] px-3 py-2 rounded-lg border-2 transition-all duration-500 relative bg-opacity-90 backdrop-blur-sm",
        isCurrent && "border-slate-500 bg-slate-900 shadow-lg shadow-slate-900/50",
        isWIP && "border-purple-500 bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
        isActive && "ring-4 ring-yellow-400 border-yellow-400 scale-105 z-50",
        // Grid pattern for WIP
        isWIP && "bg-[linear-gradient(45deg,rgba(168,85,247,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[length:10px_10px]"
      )}
    >
      <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70 flex justify-between">
        <span>{type}</span>
        <span className="opacity-50">#{fiber._debugID}</span>
      </div>
      <div className="text-sm font-medium truncate">{label}</div>

      {/* Connector Dots */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-current opacity-50" />
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-current opacity-50" />
    </div>
  );
};

const nodeTypes = {
  custom: FiberNode,
};

// Inner component to access ReactFlow hooks
const FiberTreeContent: React.FC<{ nodes: any[] }> = ({ nodes }) => {
    const { fitView } = useReactFlow();

    // Auto-fit when nodes structure changes significantly (e.g. WIP tree appears)
    useEffect(() => {
        // Debounce fitView to avoid jitter
        const timer = setTimeout(() => {
            fitView({ padding: 0.2, duration: 800 });
        }, 100);
        return () => clearTimeout(timer);
    }, [nodes.length, fitView]); // Simple heuristic: node count change triggers fitView

    return (
        <Background color="#334155" gap={20} size={1} />
    );
};

export const FiberTree: React.FC = () => {
  const currentRoot = useStore(s => s.currentRoot);
  const wipRoot = useStore(s => s.wipRoot);
  const workInProgress = useStore(s => s.workInProgress);

  // Calculate Layout
  const { nodes, edges } = useMemo(() => {
    const nodes: any[] = [];
    const edges: any[] = [];

    // Helper to layout a tree
    const layoutTree = (root: Fiber, offset: number, type: 'current' | 'wip') => {
        if (!root) return;

        const traverse = (fiber: Fiber, depth: number, xStart: number): number => {
            let width = 0;
            let child = fiber.child;

            // Layout children first to determine width
            const childWidths: number[] = [];
            let totalChildrenWidth = 0;

            if (child) {
                let c = child;
                while (c) {
                    const w = traverse(c, depth + 1, xStart + totalChildrenWidth);
                    childWidths.push(w);
                    totalChildrenWidth += w;
                    c = c.sibling!;
                }
            } else {
                width = NODE_WIDTH + 20;
            }

            width = Math.max(width, totalChildrenWidth);

            // Calculate my position (centered above children)
            const myX = xStart + (width / 2) - (NODE_WIDTH / 2) + offset;
            const myY = depth * Y_GAP + 50;

            // Add Node
            nodes.push({
                id: `node-${fiber._debugID}`, // Stable ID based on fiber ID
                type: 'custom',
                position: { x: myX, y: myY },
                data: {
                    label: typeof fiber.type === 'string' ? fiber.type : fiber.type?.name || 'Root',
                    type,
                    fiber,
                    isActive: fiber === workInProgress
                },
                draggable: false,
            });

            // Add Edges to Children
            if (fiber.child) {
                let c = fiber.child;
                while (c) {
                    edges.push({
                        id: `e-${fiber._debugID}-${c._debugID}`,
                        source: `node-${fiber._debugID}`,
                        target: `node-${c._debugID}`,
                        type: 'smoothstep',
                        style: {
                            stroke: type === 'wip' ? '#a855f7' : '#64748b',
                            strokeWidth: 2,
                            opacity: 0.8
                        },
                        markerEnd: { type: MarkerType.ArrowClosed, color: type === 'wip' ? '#a855f7' : '#64748b' },
                        animated: type === 'wip'
                    });
                    c = c.sibling!;
                }
            }

            return width;
        };

        traverse(root, 0, 0);
    };

    // 1. Layout Current Tree (Left)
    if (currentRoot) {
        layoutTree(currentRoot, 0, 'current');
    }

    // 2. Layout WIP Tree (Right)
    if (wipRoot) {
        layoutTree(wipRoot, WIP_OFFSET_X, 'wip');
    }

    // 3. Add Alternate Links (Dashed lines between versions)
    // Only if both trees exist
    if (wipRoot) {
        const addAlternateLinks = (fiber: Fiber) => {
            if (fiber.alternate) {
                // Find if alternate is in nodes (it should be if currentRoot is rendered)
                // Note: fiber.alternate might be part of currentRoot tree
                edges.push({
                    id: `alt-${fiber._debugID}-${fiber.alternate._debugID}`,
                    source: `node-${fiber.alternate._debugID}`,
                    target: `node-${fiber._debugID}`,
                    type: 'straight',
                    style: {
                        stroke: '#fbbf24', // Amber for link
                        strokeWidth: 1,
                        strokeDasharray: '5,5',
                        opacity: 0.6
                    },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#fbbf24' },
                    animated: true,
                });
            }
            if (fiber.child) addAlternateLinks(fiber.child);
            if (fiber.sibling) addAlternateLinks(fiber.sibling);
        };
        addAlternateLinks(wipRoot);
    }

    return { nodes, edges };
  }, [currentRoot, wipRoot, workInProgress]);

  return (
    <div className="w-full h-full bg-slate-950/30 rounded-xl overflow-hidden border border-slate-800/50 relative">
      {/* Background Labels */}
      <div className="absolute top-4 left-10 z-10 text-slate-500 font-mono text-sm font-bold tracking-widest pointer-events-none">
        CURRENT TREE (COMMITTED)
      </div>
      <div className="absolute top-4 right-10 z-10 text-purple-400 font-mono text-sm font-bold tracking-widest pointer-events-none">
        WORK-IN-PROGRESS (WIP)
      </div>

      {/* Empty State Placeholder for Current Tree */}
      {!currentRoot && (
         <div className="absolute top-[120px] left-[80px] z-0 text-slate-700 font-mono text-xs tracking-widest pointer-events-none flex flex-col items-center gap-2 opacity-50 border-2 border-dashed border-slate-800 rounded-lg p-4 w-[200px]">
            <div className="w-8 h-8 rounded-full bg-slate-800/50" />
            <span>WAITING FOR COMMIT...</span>
         </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="transition-all duration-500"
        minZoom={0.2}
        maxZoom={2.0}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <FiberTreeContent nodes={nodes} />
      </ReactFlow>
    </div>
  );
};
