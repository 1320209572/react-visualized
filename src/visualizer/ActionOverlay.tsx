import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';

type ParticleType = 'read' | 'write' | 'bind';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  type: ParticleType;
}

const getElementCenter = (id: string) => {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`ActionOverlay: Element not found: ${id}`);
        // Fallback for debugging: if in dev mode, return random position?
        // No, better to return null and let the component handle it or fallback to center
        return null;
    }
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
};

export const ActionOverlay: React.FC = () => {
  const lastAction = useStore(s => s.lastAction);
  const currentScenario = useStore(s => s.currentScenario);
  const workInProgress = useStore(s => s.workInProgress);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Listen for actions and spawn particles
  useEffect(() => {
    if (!lastAction) return;

    // We need a small delay to ensure DOM has updated (e.g. if a node just appeared)
    const timer = setTimeout(() => {
        const timestamp = Date.now();
        const newParticles: Particle[] = [];
        let debugMsg = `Action: ${lastAction.type}`;

        // 1. READ STREAM: Heap -> Stack
        if (lastAction.type === 'HOOK_READ_STATE') {
            const hookIndex = (lastAction as any).index;
            let varName = 'state';
            let setterName = 'setState';
            if (currentScenario) {
                const match = currentScenario.code.match(/const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState/);
                if (match) {
                     varName = match[1];
                     setterName = match[2];
                }
            }

            if (hookIndex > 0) {
                varName = 'unknown';
            }

            let sourcePos = getElementCenter(`memory-hook-${hookIndex}`);
            let targetVarPos = getElementCenter(`stack-var-${varName}`);
            let targetSetterPos = getElementCenter(`stack-var-${setterName}`);

            debugMsg += ` | Hook${hookIndex} -> ${varName}`;

            // Fallback for demo if elements missing (e.g. during fast re-renders)
            if (!sourcePos) sourcePos = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.5 };
            if (!targetVarPos) targetVarPos = { x: window.innerWidth * 0.2, y: window.innerHeight * 0.4 };

            if (sourcePos && targetVarPos) {
                newParticles.push({
                    id: timestamp,
                    startX: sourcePos.x,
                    startY: sourcePos.y,
                    endX: targetVarPos.x,
                    endY: targetVarPos.y,
                    color: '#22d3ee', // Cyan
                    type: 'read'
                });
            }

            if (sourcePos && targetSetterPos) {
                 newParticles.push({
                    id: timestamp + 1,
                    startX: sourcePos.x,
                    startY: sourcePos.y,
                    endX: targetSetterPos.x,
                    endY: targetSetterPos.y,
                    color: '#f59e0b', // Orange
                    type: 'bind'
                });
            }

            // 1.1 EXTRA STREAM: Heap -> WIP Fiber Node (User Request)
            // "Data particles from FIBER HEAP fly to WIP NODE"
            if (workInProgress) {
                 const fiberNodeId = `fiber-node-wip-${workInProgress._debugID}`;
                 const targetWipNodePos = getElementCenter(fiberNodeId);

                 if (sourcePos && targetWipNodePos) {
                     newParticles.push({
                        id: timestamp + 3,
                        startX: sourcePos.x,
                        startY: sourcePos.y,
                        endX: targetWipNodePos.x,
                        endY: targetWipNodePos.y,
                        color: '#22d3ee', // Cyan (Data)
                        type: 'read'
                     });
                 }
            }
        }

        // 2. DISPATCH STREAM: Stack/Event -> Heap
        if (lastAction.type === 'DISPATCH_ACTION') {
             const hookIndex = (lastAction as any).index || 0;
             let targetHookPos = getElementCenter(`memory-hook-${hookIndex}`);

             // Fallback
             if (!targetHookPos) targetHookPos = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.5 };

             // Simulate origin from "somewhere left" (Stack or Button)
             const startX = window.innerWidth * 0.2;
             const startY = window.innerHeight * 0.6;

             debugMsg += ` | Dispatch -> Hook${hookIndex}`;

             if (targetHookPos) {
                 newParticles.push({
                     id: timestamp + 2,
                     startX: startX,
                     startY: startY,
                     endX: targetHookPos.x,
                     endY: targetHookPos.y,
                     color: '#f59e0b', // Orange
                     type: 'write'
                 });
             }
        }

        setDebugInfo(debugMsg);

        if (newParticles.length > 0) {
            setParticles(prev => [...prev, ...newParticles]);
            // Cleanup
            setTimeout(() => {
                setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
            }, 2000);
        }

    }, 50); // Small delay

    return () => clearTimeout(timer);

  }, [lastAction, currentScenario]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Debug Info (Hidden in prod, useful now) */}
      {/* <div className="absolute top-20 right-10 bg-black/80 text-green-400 text-xs p-2 font-mono">
          {debugInfo} <br/>
          Particles: {particles.length}
      </div> */}

      <AnimatePresence>
        {particles.map(p => (
          <ParticleActor key={p.id} particle={p} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ParticleActor: React.FC<{ particle: Particle }> = ({ particle }) => {
    // Calculate control point for Bezier curve
    // If read (Right to Left): Curve up
    // If write (Left to Right): Curve down
    const isRightToLeft = particle.startX > particle.endX;

    // Randomize curve slightly
    const arcHeight = (isRightToLeft ? -100 : 100) + (Math.random() * 50 - 25);

    // We simulate the path using framer-motion keyframes on X and Y independently
    const midX = (particle.startX + particle.endX) / 2;
    const midY = (particle.startY + particle.endY) / 2 + arcHeight;

    const [showRipple, setShowRipple] = useState(false);

    return (
        <>
            <motion.div
                initial={{
                    x: particle.startX,
                    y: particle.startY,
                    scale: 0,
                    opacity: 0
                }}
                animate={{
                    x: [particle.startX, midX, particle.endX],
                    y: [particle.startY, midY, particle.endY],
                    scale: [0, 1.5, 1, 0.5], // Pop and shrink
                    opacity: [0, 1, 1, 1] // Keep opacity at end to transition to ripple
                }}
                transition={{
                    duration: particle.type === 'bind' ? 1.2 : 0.8,
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
                }}
                onAnimationComplete={() => setShowRipple(true)}
                className="absolute flex items-center justify-center pointer-events-none"
            >
                {/* Core Particle - Hide when ripple starts */}
                {!showRipple && (
                    <div
                        className="w-3 h-3 rounded-full shadow-[0_0_15px_currentColor]"
                        style={{
                            backgroundColor: particle.color,
                            color: particle.color
                        }}
                    />
                )}

                {/* Trail */}
                {!showRipple && (
                    <motion.div
                        className="absolute w-20 h-1 rounded-full opacity-50 blur-sm"
                        style={{
                            backgroundColor: particle.color,
                            transformOrigin: 'left',
                        }}
                        animate={{ scale: [1, 2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.2 }}
                    />
                )}
            </motion.div>

            {/* Collision Ripple at Destination */}
            {showRipple && (
                <motion.div
                    style={{
                        position: 'absolute',
                        left: particle.endX,
                        top: particle.endY,
                        transform: 'translate(-50%, -50%)',
                        border: `2px solid ${particle.color}`,
                    }}
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{ width: 50, height: 50, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="rounded-full pointer-events-none z-[10000]"
                />
            )}
        </>
    );
};
