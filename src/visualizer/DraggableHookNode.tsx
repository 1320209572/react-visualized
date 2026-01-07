import React, { useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { clsx } from 'clsx';
import type { Hook } from '../engine/types';

// Simple implementation of PhysicsValue for this component
const PhysicsValue = ({ value }: { value: any }) => (
    <span className="font-mono text-lg text-gray-200 font-bold drop-shadow-md">
        {JSON.stringify(value)}
    </span>
);

const HOOK_WIDTH = 140;
const HOOK_HEIGHT = 90;

interface DraggableHookNodeProps {
    hook: Hook;
    index: number;
    initialX: number;
    initialY: number;
    onDrag: (index: number, x: number, y: number) => void;
    nodeRef?: React.Ref<HTMLDivElement>;
}

export const DraggableHookNode: React.FC<DraggableHookNodeProps> = ({ hook, index, initialX, initialY, onDrag, nodeRef }) => {
    const [{ x, y, scale }, api] = useSpring(() => ({ x: initialX, y: initialY, scale: 1 }));

    // Bind drag gesture
    const bind = useDrag(({ down, offset: [ox, oy] }) => {
        api.start({ x: ox + initialX, y: oy + initialY, scale: down ? 1.1 : 1, immediate: down });
    }, { from: () => [x.get() - initialX, y.get() - initialY] });

    // Hook Type Detection
    const isEffect = hook.memoizedState && typeof hook.memoizedState === 'object' && 'create' in hook.memoizedState && 'deps' in hook.memoizedState;
    const hookType = isEffect ? 'useEffect' : 'useState';
    const hasQueue = hook.queue && hook.queue.pending;

    return (
        <animated.div
            {...bind()}
            ref={nodeRef}
            id={`memory-hook-${index}`}
            style={{ x, y, scale, width: HOOK_WIDTH, height: HOOK_HEIGHT, position: 'absolute', touchAction: 'none', zIndex: 10 }}
            className="cursor-grab active:cursor-grabbing"
        >
             <div className={clsx(
                "w-full h-full rounded-lg backdrop-blur-md transition-all duration-300 flex flex-col overflow-hidden relative group",
                isEffect
                    ? "bg-purple-900/40 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4),inset_0_0_20px_rgba(168,85,247,0.2)]"
                    : (hasQueue
                        ? "bg-amber-900/40 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.4),inset_0_0_20px_rgba(245,158,11,0.2)]"
                        : "bg-cyan-900/40 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_0_20px_rgba(6,182,212,0.2)]")
            )}>
                {/* Crystal Facets Highlights */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50" />
                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-white/20" />
                <div className="absolute top-0 left-0 w-[1px] h-full bg-white/30" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                {/* Header */}
                <div className={clsx(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b flex justify-between items-center z-10",
                    isEffect
                        ? "border-purple-500/30 text-purple-200"
                        : (hasQueue ? "border-amber-500/30 text-amber-200" : "border-cyan-500/30 text-cyan-200")
                )}>
                    <span>HOOK {index}</span>
                    <span className="opacity-70">{hookType}</span>
                </div>

                {/* Body */}
                <div className="flex-1 p-3 flex flex-col justify-center items-center relative z-10">
                    <div className="text-[9px] text-gray-400 mb-1 font-mono tracking-widest uppercase opacity-70">
                        {isEffect ? 'DEPS' : 'MEMO'}
                    </div>

                    {isEffect ? (
                        <div className="flex gap-1">
                            {hook.memoizedState.deps ? (
                                hook.memoizedState.deps.length === 0 ? <span className="text-[10px] text-gray-400">[] (Mount Only)</span> :
                                hook.memoizedState.deps.map((d: any, i: number) => (
                                    <span key={i} className="bg-black/30 px-1 rounded text-[10px] font-mono text-purple-200 border border-purple-500/20">
                                        {JSON.stringify(d)}
                                    </span>
                                ))
                            ) : <span className="text-[10px] text-orange-400">No Deps</span>}
                        </div>
                    ) : (
                        <PhysicsValue value={hook.memoizedState} />
                    )}
                </div>
            </div>
        </animated.div>
    );
};
