import React, { useMemo, useEffect } from 'react';
import { ReactFlow, Background, MarkerType, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store';
import type { Fiber } from '../engine/types';
import { clsx } from 'clsx';

const NODE_WIDTH = 140;
const Y_GAP = 120;
// 3D Offset for Layered Effect
const WIP_Z_INDEX = 50;
const WIP_Y_OFFSET = -50; // Visual lift
const WIP_X_OFFSET = 20;  // Slight shift right

// Custom Node Component - Cyber-Bio Style
const FiberNode = ({ data }: any) => {
  const { label, type, fiber, isActive } = data;
  const isWIP = type === 'wip';
  const isCurrent = type === 'current';

  return (
    <div
      className={clsx(
        "w-[140px] px-3 py-2 rounded-lg transition-all duration-500 relative backdrop-blur-md overflow-hidden",
        // Glassmorphism Base
        "border border-white/10 shadow-lg",
        // Current: Deep Blue/Grey, recessed
        isCurrent && "bg-slate-900/60 border-slate-700/50 shadow-slate-900/50 opacity-80 scale-95",
        // WIP: Neon Purple/Cyan, floating, pulsing
        isWIP && "bg-purple-900/40 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] z-50",
        // Active State: High energy
        isActive && "ring-2 ring-yellow-400 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] scale-105 bg-yellow-900/20"
      )}
    >
      {/* Internal "Bio" fluid effect for WIP */}
      {isWIP && (
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.5),transparent_70%)] animate-pulse" />
      )}

      <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70 flex justify-between relative z-10">
        <span className={isWIP ? "text-purple-300" : "text-slate-400"}>{type}</span>
        <span className="opacity-50">#{fiber._debugID}</span>
      </div>
      <div className="text-sm font-medium truncate relative z-10 text-white/90">{label}</div>

      {/* Connector Dots - Glowing Terminals */}
      <div className={clsx(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
          isWIP ? "bg-purple-400 shadow-[0_0_5px_#a855f7]" : "bg-slate-600"
      )} />
      <div className={clsx(
          "absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
          isWIP ? "bg-purple-400 shadow-[0_0_5px_#a855f7]" : "bg-slate-600"
      )} />
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
        <>
            <Background color="#1e293b" gap={20} size={1} />
            {/* SVG Filters for Neon Glow */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
            </svg>
        </>
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
    const layoutTree = (root: Fiber, offset: number, zIndex: number, type: 'current' | 'wip') => {
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
            // WIP nodes are physically offset to create 3D layer effect
            const myX = xStart + (width / 2) - (NODE_WIDTH / 2) + (type === 'wip' ? WIP_X_OFFSET : 0);
            const myY = depth * Y_GAP + 50 + (type === 'wip' ? WIP_Y_OFFSET : 0);

            nodes.push({
                id: `node-${fiber._debugID}`, // Stable ID based on fiber ID
                type: 'custom',
                position: { x: myX, y: myY },
                zIndex: type === 'wip' ? 100 : 0, // Force Z-layering
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
                            stroke: type === 'wip' ? '#a855f7' : '#334155',
                            strokeWidth: type === 'wip' ? 3 : 1,
                            opacity: type === 'wip' ? 0.8 : 0.3,
                            filter: type === 'wip' ? 'url(#glow)' : undefined
                        },
                        markerEnd: { type: MarkerType.ArrowClosed, color: type === 'wip' ? '#a855f7' : '#334155' },
                        animated: type === 'wip'
                    });
                    c = c.sibling!;
                }
            }

            return width;
        };

        traverse(root, 0, 0);
    };

    // 1. Current Tree (Bottom Layer)
    if (currentRoot) {
        layoutTree(currentRoot, 0, 0, 'current');
    }

    // 2. Layout WIP Tree (Top Layer) - Overlapping!
    if (wipRoot) {
        layoutTree(wipRoot, 0, 1, 'wip');
    }

    // 3. Add Alternate Links (Dashed lines between versions)
    // Only if both trees exist
    if (wipRoot && currentRoot) {
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
                        strokeDasharray: '4,4',
                        opacity: 0.4
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
      <div className="absolute top-4 left-6 z-0 text-slate-600 font-mono text-xs font-bold tracking-widest pointer-events-none flex flex-col gap-1">
        <span>LAYER 0: COMMITTED</span>
        <span className="text-purple-500/50">LAYER 1: WORK-IN-PROGRESS</span>
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
