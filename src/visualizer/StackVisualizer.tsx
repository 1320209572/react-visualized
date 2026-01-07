import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { clsx } from 'clsx';
import { useStepController } from '../hooks/useStepController';

export const StackVisualizer: React.FC = () => {
  const workInProgress = useStore(s => s.workInProgress);
  const currentAction = useStore(s => s.currentStepAction);
  const currentScenario = useStore(s => s.currentScenario);
  const { currentStep } = useStepController();

  // Parse variable names
  const variableNames = useMemo(() => {
      if (!currentScenario) return ['state', 'setState'];
      const match = currentScenario.code.match(/const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState/);
      if (match) {
          return [match[1], match[2]];
      }
      return ['state', 'setState'];
  }, [currentScenario]);

  // Determine values based on current action
  let varValue = 'uninitialized';
  let setterValue = 'uninitialized';

  if (workInProgress && workInProgress.memoizedState) {
      if (workInProgress.memoizedState.memoizedState !== undefined) {
         varValue = JSON.stringify(workInProgress.memoizedState.memoizedState);
         setterValue = 'ƒ()';
      }
  }

  // Override for initial phases
  if (currentStep === 'INVOKE' || currentStep === 'HEAP_LOOKUP') {
      varValue = '...';
      setterValue = '...';
  }

  if (currentStep === 'DATA_TRANSFER' && currentAction.type === 'HOOK_READ_STATE') {
      varValue = JSON.stringify((currentAction as any).value);
  }

  // Ghost Mode: Keep showing the frame even if workInProgress is null (IDLE),
  // until we are explicitly past STACK_CLEANUP or resetting.
  // Actually, we want to show it DURING 'STACK_CLEANUP'.
  const showFrame = workInProgress || currentStep === 'STACK_CLEANUP' || currentStep === 'COMMIT_SYNC' || currentStep === 'VDOM_GEN';

  // SHATTER EFFECT:
  // When currentStep === 'STACK_CLEANUP', we switch variants to 'exploded'.

  return (
    <div className="h-full w-full bg-[#0a0a0c]/90 flex flex-col relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#312e81_1px,transparent_1px),linear-gradient(to_bottom,#312e81_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

        {/* Header */}
        <div className="px-4 py-2 border-b border-purple-900/30 bg-purple-950/10 backdrop-blur-sm flex items-center gap-2 z-20">
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7] animate-pulse" />
            <h3 className="text-xs font-bold tracking-widest text-purple-400/80">CALL STACK</h3>
        </div>

        {/* Stack Frames */}
        <div className="flex-1 p-4 flex flex-col-reverse gap-3 overflow-hidden pb-10">
            <AnimatePresence>
                {showFrame && (
                    <motion.div
                        key="stack-frame"
                        id="current-stack-frame" // Hook for VisualOrchestrator
                        initial={{ y: 200, opacity: 0, rotateX: 45 }}
                        animate={currentStep === 'STACK_CLEANUP' ? "exploded" : "visible"}
                        variants={{
                            visible: {
                                y: 0,
                                opacity: 1,
                                rotateX: 0,
                                scale: 1,
                                filter: 'blur(0px)',
                                transition: { type: "spring", bounce: 0.3 }
                            },
                            exploded: {
                                y: 20,
                                opacity: 0,
                                scale: 0.95,
                                filter: 'blur(2px)',
                                transition: {
                                    duration: 0.3,
                                    ease: "easeIn"
                                }
                            }
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 backdrop-blur-xl shadow-[0_4px_20px_rgba(168,85,247,0.15)] relative overflow-hidden group perspective-500 origin-center"
                    >
                        {/* Glass Shine */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none opacity-50" />

                        {/* Header */}
                        <div className="text-[10px] text-purple-300/70 mb-3 border-b border-purple-500/20 pb-1 flex justify-between items-center">
                            <span className="font-bold text-purple-200">
                                {workInProgress?.type?.name || 'Counter'}
                            </span>
                            <span className="text-purple-500 font-mono text-[9px]">0x7FF...</span>
                        </div>

                        {/* Variables */}
                        <div className="flex flex-col gap-3">
                            {/* Variable 1 */}
                            <FrameItem label={variableNames[0]} value={varValue} type="var" highlight={currentStep === 'DATA_TRANSFER'} />
                            {/* Variable 2 */}
                            <FrameItem label={variableNames[1]} value={setterValue} type="func" highlight={currentStep === 'INVOKE'} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!showFrame && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-purple-900/30 text-xs font-mono mb-10"
                >
                    // IDLE: WAITING FOR INVOCATION
                </motion.div>
            )}
        </div>
    </div>
  );
};

const FrameItem = ({ label, value, type, highlight }: any) => (
    <motion.div
        layout
        className={clsx(
            "flex justify-between items-center text-xs font-mono p-1.5 rounded border border-transparent transition-all duration-300",
            highlight
                ? "bg-purple-500/20 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] scale-105 origin-left"
                : "hover:bg-white/5"
        )}
    >
        <span className="text-gray-400 opacity-70">{label}:</span>
        <span
            id={`stack-var-${label}`}
            className={clsx(
            "font-bold transition-all duration-300 relative z-10",
            type === 'func' && "text-yellow-400",
            type === 'var' && "text-purple-300",
            value === '...' && "opacity-30 italic font-normal"
        )}>
            {value}
        </span>
    </motion.div>
);
