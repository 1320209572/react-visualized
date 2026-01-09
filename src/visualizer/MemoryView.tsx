import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import type { Hook, Fiber } from '../engine/types';
import { StackVisualizer } from './StackVisualizer';
import { DraggableHookNode } from './DraggableHookNode';
import { useStepController } from '../hooks/useStepController';
import { MousePointer2 } from 'lucide-react';

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
  const { currentStep } = useStepController();
  const currentAction = useStore(s => s.currentStepAction);

  // Extract pointer index
  const activeHookIndex = currentAction && 'index' in currentAction ? (currentAction as any).index : -1;
  const showPointer = ['HOOK_ENTER', 'HOOK_READ_STATE', 'HOOK_COMPUTE'].includes(currentStep);

  // Extract hooks list
  let sourceFiber: Fiber | null = null;

  // Helper to find function component in a tree
  const findFunComp = (fiber: Fiber | null): Fiber | null => {
      if (!fiber) return null;
      if (fiber.tag === 'FunctionComponent') return fiber;
      // Simple DFS
      return findFunComp(fiber.child) || findFunComp(fiber.sibling);
  };

  // 1. Try to find in WIP tree (if we are deep in render)
  if (workInProgress) {
      if (workInProgress.tag === 'FunctionComponent') {
          sourceFiber = workInProgress;
      } else if (workInProgress.tag === 'HostRoot') {
           if (workInProgress.alternate) {
               sourceFiber = findFunComp(workInProgress.alternate);
           }
      }
  }

  // 2. If no source yet, try Current Root
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
                                key={`${i}-${hooks.length}`}
                                startRef={{ current: document.getElementById(`memory-hook-${i}`) as HTMLDivElement }}
                                endRef={{ current: document.getElementById(`memory-hook-${i+1}`) as HTMLDivElement }}
                            />
                        );
                    })}
                </svg>

                {/* Nodes Layer */}
                <AnimatePresence>
                    {hooks.map((hook, i) => {
                        const x = START_X + i * (HOOK_WIDTH + GAP);
                        const y = 100;

                        return (
                            <div key={i} className="absolute" style={{ left: 0, top: 0 }}>
                                <DraggableHookNode
                                    hook={hook}
                                    index={i}
                                    initialX={x}
                                    initialY={y}
                                    onDrag={() => {}}
                                    nodeRef={(el) => { if(el) nodeRefs.current[i] = el; }}
                                />

                                {/* Physical Linked List Pointer */}
                                {showPointer && activeHookIndex === i && (
                                    <motion.div
                                        layoutId="heap-pointer"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        style={{ left: x + HOOK_WIDTH / 2 - 12, top: y - 40 }}
                                        className="absolute z-50 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                    >
                                        <MousePointer2 size={24} className="fill-cyan-950" />
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-900/80 px-2 py-0.5 rounded text-[10px] font-mono border border-cyan-500/30 text-cyan-200">
                                            HEAD.next
                                        </div>
                                    </motion.div>
                                )}
                            </div>
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
