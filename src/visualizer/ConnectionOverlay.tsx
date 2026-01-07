import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { useStepController } from '../hooks/useStepController';

export const ConnectionOverlay: React.FC = () => {
  const [lines, setLines] = useState<{ x1: number, y1: number, x2: number, y2: number, id: string, type: 'hook' | 'stack' | 'sync' }[]>([]);
  const workInProgress = useStore(s => s.workInProgress);
  const currentRoot = useStore(s => s.currentRoot);
  const currentStepAction = useStore(s => s.currentStepAction);
  const { currentStep } = useStepController();

  // Animation frame loop for smooth tracking
  useEffect(() => {
    let rafId: number;

    const update = () => {
        const newLines: any[] = [];

        // 1. Hook Connections (Code <-> Heap)
        for (let i = 0; i < 2; i++) {
            const source = document.getElementById(`code-hook-${i}`);
            const target = document.getElementById(`memory-hook-${i}`);

            if (source && target) {
                const srcRect = source.getBoundingClientRect();
                const tgtRect = target.getBoundingClientRect();

                newLines.push({
                    id: `hook-${i}`,
                    type: 'hook',
                    x1: srcRect.right,
                    y1: srcRect.top + srcRect.height / 2,
                    x2: tgtRect.left,
                    y2: tgtRect.top + tgtRect.height / 2
                });
            }
        }

        // 2. Stack Execution Beam (Stack <-> WIP Fiber)
        // Hide beam during cleanup/explosions to prevent visual chaos
        if (workInProgress && currentStep !== 'STACK_CLEANUP') {
            const stackFrame = document.getElementById('current-stack-frame');
            // Use the specific node ID format from FiberTree
            const fiberNode = document.getElementById(`fiber-node-node-${workInProgress._debugID}`);

            // Only show beam during active execution steps
            const isActive = ['RENDER_START', 'HOOK_ENTER', 'HOOK_READ_STATE', 'HOOK_COMPUTE', 'HOOK_EXIT'].some(t => currentStepAction.type === t);

            if (stackFrame && fiberNode && isActive) {
                const srcRect = stackFrame.getBoundingClientRect();
                const tgtRect = fiberNode.getBoundingClientRect();

                newLines.push({
                    id: 'execution-beam',
                    type: 'stack',
                    x1: srcRect.left + srcRect.width / 2,
                    y1: srcRect.top,
                    x2: tgtRect.left + tgtRect.width / 2,
                    y2: tgtRect.bottom
                });
            }
        }

        // 3. Sync Cable (Current Tree <-> Preview)
        // Hide during Commit Swap to avoid cable jumping wildly
        if (currentRoot && currentStep !== 'COMMIT_SYNC') {
            const currentNode = document.getElementById(`fiber-node-node-${currentRoot._debugID}`);
            const previewContainer = document.getElementById('render-preview-container') || document.getElementById('preview-root');

            if (currentNode && previewContainer) {
                const nodeRect = currentNode.getBoundingClientRect();
                const previewRect = previewContainer.getBoundingClientRect();

                // Draw from left of node to right of preview
                newLines.push({
                    id: 'sync-cable',
                    type: 'sync',
                    x1: previewRect.right,
                    y1: previewRect.top + 50, // Approx header height offset
                    x2: nodeRect.left,
                    y2: nodeRect.top + nodeRect.height / 2
                });
            }
        }

        setLines(newLines);
        rafId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(rafId);
  }, [workInProgress, currentStepAction, currentRoot, currentStep]);

  return (
    <svg style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
      {lines.map(line => {
        const commonProps = {
            pointerEvents: 'none' as const, // CRITICAL: Ensure paths don't block clicks
        };

        if (line.type === 'hook') {
            return (
                <path
                    key={line.id}
                    d={`M ${line.x1} ${line.y1} C ${line.x1 + 100} ${line.y1}, ${line.x2 - 100} ${line.y2}, ${line.x2} ${line.y2}`}
                    fill="none"
                    stroke="#4ec9b0"
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    strokeDasharray="5,5"
                    {...commonProps}
                />
            );
        } else if (line.type === 'sync') {
             return (
                <g key={line.id} {...commonProps}>
                    <path
                        d={`M ${line.x1} ${line.y1} C ${line.x1 + 100} ${line.y1}, ${line.x2 - 100} ${line.y2}, ${line.x2} ${line.y2}`}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="8"
                        strokeOpacity="0.8"
                    />
                    <path
                        d={`M ${line.x1} ${line.y1} C ${line.x1 + 100} ${line.y1}, ${line.x2 - 100} ${line.y2}, ${line.x2} ${line.y2}`}
                        fill="none"
                        stroke="#475569"
                        strokeWidth="4"
                    />
                    <circle r="3" fill="#38bdf8">
                        <animateMotion
                            dur="2s"
                            repeatCount="indefinite"
                            path={`M ${line.x1} ${line.y1} C ${line.x1 + 100} ${line.y1}, ${line.x2 - 100} ${line.y2}, ${line.x2} ${line.y2}`}
                        />
                    </circle>
                </g>
            );
        } else {
            return (
                <g key={line.id} {...commonProps}>
                    <path
                        d={`M ${line.x1} ${line.y1} Q ${line.x1} ${(line.y1 + line.y2)/2}, ${line.x2} ${line.y2}`}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="4"
                        strokeOpacity="0.3"
                        filter="url(#glow)"
                    />
                    <path
                        d={`M ${line.x1} ${line.y1} Q ${line.x1} ${(line.y1 + line.y2)/2}, ${line.x2} ${line.y2}`}
                        fill="none"
                        stroke="#d8b4fe"
                        strokeWidth="2"
                        strokeDasharray="10,10"
                        className="animate-beam-flow"
                    >
                        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" repeatCount="indefinite" />
                    </path>
                </g>
            );
        }
      })}
      <defs>
        <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>
    </svg>
  );
};
