import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { GravitationalLink } from './GravitationalLink';

export const PhysicsLinks: React.FC = () => {
    const workInProgress = useStore(s => s.workInProgress);
    const currentScenario = useStore(s => s.currentScenario);
    const [links, setLinks] = useState<{source: string, target: string, id: string, color?: string, dashed?: boolean}[]>([]);

    useEffect(() => {
        // Re-calculate active links based on current state
        // For basic counter: Stack 'count' <-> Heap Hook 0

        const newLinks: {source: string, target: string, id: string, color?: string}[] = [];

        if (workInProgress && workInProgress.memoizedState) {
            // Hook 0
            const hook0Id = 'memory-hook-0';
            // Parse var name - MUST match StackVisualizer defaults!
            let varName = 'state';
            let setterName = 'setState';

            if (currentScenario) {
                const match = currentScenario.code.match(/const\s+\[(\w+),\s*(\w+)\]\s*=\s*useState/);
                if (match) {
                    varName = match[1];
                    setterName = match[2];
                } else {
                    // Fallback to manual check or known scenarios if regex fails
                    // Or just use 'count'/'setCount' if we know it's the counter scenario
                    if (currentScenario.id.includes('counter')) {
                        varName = 'count';
                        setterName = 'setCount';
                    }
                }
            }
            const stackVarId = `stack-var-${varName}`;
            const stackSetterId = `stack-var-${setterName}`;

            // Always add links, let GravitationalLink handle DOM existence
            newLinks.push({
                source: hook0Id,
                target: stackVarId,
                id: 'link-val',
                color: '#22d3ee' // Cyan
            });

            newLinks.push({
                source: hook0Id,
                target: stackSetterId,
                id: 'link-set',
                color: '#f59e0b' // Orange
            });
        }

        // Link 3: Execution Context (Purple)
        // Stack Frame -> WIP Fiber Node
        if (workInProgress) {
            const stackFrameId = 'current-stack-frame';
            // In FiberTree we prefixed IDs with 'wip-'
            const fiberNodeId = `wip-${workInProgress._debugID}`;
            const targetDomId = `fiber-node-${fiberNodeId}`;

            // Check if element exists (GravitationalLink is robust, but we check to be safe)
            if (document.getElementById(stackFrameId) && document.getElementById(targetDomId)) {
                newLinks.push({
                    source: stackFrameId,
                    target: targetDomId,
                    id: 'link-context',
                    color: '#a855f7', // Purple
                    dashed: true
                });
            }
        }

        setLinks(newLinks);
    }, [workInProgress, currentScenario]); // Re-evaluate when fiber/scenario changes

    return (
        <>
            {links.map(link => (
                <GravitationalLink
                    key={link.id}
                    sourceId={link.source}
                    targetId={link.target}
                    active={true}
                    color={link.color}
                    dashed={link.dashed}
                />
            ))}
        </>
    );
};
