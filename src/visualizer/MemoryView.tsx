import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Keep framer-motion for simple enters/exits or other UI
import { useStore } from '../store';
import type { Hook } from '../engine/types';
import { StackVisualizer } from './StackVisualizer';
import { DraggableHookNode } from './DraggableHookNode';

// Constants
const HOOK_WIDTH = 140;
const GAP = 80;
const START_X = 50;

// Dynamic Arrow Component - Keeps the linked list connection visual
const ElasticArrow = ({ startRef, endRef }: { startRef: React.RefObject<HTMLDivElement>, endRef: React.RefObject<HTMLDivElement> }) => {
    const [pathD, setPathD] = useState('');

    useEffect(() => {
        const update = () => {
            if (startRef.current && endRef.current) {
                const r1 = startRef.current.getBoundingClientRect();
                const r2 = endRef.current.getBoundingClientRect();
                // Find common parent (the stage container)
                const container = document.getElementById('heap-stage');
                const parent = container?.getBoundingClientRect();

                if (parent) {
                    const x1 = r1.right - parent.left;
                    const y1 = r1.top + r1.height/2 - parent.top;
                    const x2 = r2.left - parent.left;
                    const y2 = r2.top + r2.height/2 - parent.top;

                    // Bezier Curve
                    const cp1x = x1 + 50;
                    const cp1y = y1;
                    const cp2x = x2 - 50;
                    const cp2y = y2;

                    setPathD(`M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
                }
            }
        };

        let rafId: number;
        const loop = () => {
            update();
            rafId = requestAnimationFrame(loop);
        };
        loop();

        return () => cancelAnimationFrame(rafId);
    }, []);

    if (!pathD) return null;

    return (
        <motion.path
            d={pathD}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeOpacity="0.6"
            markerEnd="url(#arrowhead-glow)"
            filter="url(#glow-line)"
        />
    );
};

export const MemoryView: React.FC = () => {
  const workInProgress = useStore(s => s.workInProgress);
  const currentRoot = useStore(s => s.currentRoot);

  // Extract hooks list
  // Logic:
  // We want to stabilize the view. Even if WIP is at Root, we want to see the Component's hooks.
  // We traverse to find the first FunctionComponent that has state.

  let sourceFiber: any = null;

  // Helper to find function component in a tree
  const findFunComp = (fiber: any): any => {
      if (!fiber) return null;
      if (fiber.tag === 'FunctionComponent') return fiber;
      // Simple DFS
      return findFunComp(fiber.child) || findFunComp(fiber.sibling);
  };

  // 1. Try to find in WIP tree (if we are deep in render)
  if (workInProgress) {
      // If we are currently AT the component, use it
      if (workInProgress.tag === 'FunctionComponent') {
          sourceFiber = workInProgress;
      }
      // If we are at Root, try to peek at child (if constructed) or alternate's child
      else if (workInProgress.tag === 'HostRoot') {
           // If alternate exists (update scenario), show the OLD state from alternate tree
           // until we actually reach the component in the new tree.
           if (workInProgress.alternate) {
               sourceFiber = findFunComp(workInProgress.alternate);
           }
      }
  }

  // 2. If no source yet, try Current Root (Idle state or initial mount finished)
  if (!sourceFiber && currentRoot) {
      sourceFiber = findFunComp(currentRoot);
  }

  // 3. Extract hooks
  const hooks: Hook[] = [];
  if (sourceFiber && sourceFiber.memoizedState) {
      let current = sourceFiber.memoizedState;
      while(current) {
          hooks.push(current);
          current = current.next;
      }
  }

  // Ref array to track DOM elements for arrows
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Ensure ref array size matches hooks length
  if (nodeRefs.current.length !== hooks.length) {
      nodeRefs.current = Array(hooks.length).fill(null);
  }

  return (
    <div className="h-full w-full flex">
      {/* Left: Call Stack (30%) */}
      <div className="w-[30%] min-w-[250px] relative z-20 shadow-2xl">
          <StackVisualizer />
      </div>

      {/* Right: Heap (70%) - The Stage */}
      <div id="heap-stage" className="flex-1 relative overflow-hidden bg-[#0a0a0c]/90 perspective-1000">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none transform rotate-x-12 scale-110" />

        {/* Header */}
        <div className="absolute top-4 left-6 z-20 flex items-center gap-2 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <h3 className="text-xs font-bold tracking-widest text-cyan-400/80">FIBER HEAP SPACE</h3>
        </div>

        {/* Fiber Container (Floating Stage) */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
                {/* SVG Layer for Arrows */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 5 }}>
                    <defs>
                        <marker id="arrowhead-glow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
                        </marker>
                        <filter id="glow-line">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    {hooks.map((_, i) => {
                        if (i >= hooks.length - 1) return null;
                        return (
                            <ElasticArrow
                                key={i}
                                startRef={{ current: nodeRefs.current[i] }}
                                endRef={{ current: nodeRefs.current[i+1] }}
                            />
                        );
                    })}
                </svg>

                {/* Nodes Layer */}
                <AnimatePresence>
                    {hooks.map((hook, i) => {
                        // Position in the center of the stage vertically
                        // The stage is roughly 300-400px high in the layout
                        const x = START_X + i * (HOOK_WIDTH + GAP);
                        const y = 100; // Fixed offset from top of container, much safer than window calc

                        return (
                            <DraggableHookNode
                                key={i}
                                hook={hook}
                                index={i}
                                initialX={x}
                                initialY={y}
                                onDrag={() => {}}
                                nodeRef={el => nodeRefs.current[i] = el}
                            />
                        );
                    })}
                </AnimatePresence>

                {!workInProgress && (
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-900/30 text-sm font-mono tracking-widest pointer-events-none">
                        // WAITING FOR RENDER CYCLE
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
