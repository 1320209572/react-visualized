import React, { useEffect, useRef } from 'react';
import { useStepController } from '../hooks/useStepController';
import confetti from 'canvas-confetti';
import { useStore } from '../store';

// This component acts as the Director.
// It watches the Step State and triggers global FX.
export const VisualOrchestrator: React.FC = () => {
    const { currentStep, stepIndex } = useStepController();
    const workInProgress = useStore(s => s.workInProgress);

    // Prevent duplicate triggers for the same step
    const lastStepRef = useRef<string | null>(null);
    // Prevent FX on initial load
    const isMounted = useRef(false);

    useEffect(() => {
        // Initial mount check
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        // 1. DEDUP: If step hasn't changed, ignore
        if (currentStep === lastStepRef.current) {
            return;
        }
        lastStepRef.current = currentStep;

        // 2. SAFETY: Don't play explosions on step 0/1 (initial load scenarios)
        if (stepIndex <= 1 && currentStep !== 'STACK_CLEANUP') {
            return;
        }

        // GLOBAL FX TRIGGER
        switch (currentStep) {
            case 'INVOKE':
                // RENDER START: Cloning
                // Reduced intensity
                triggerCloningEffect();
                break;

            case 'HOOK_ENTER':
            case 'HOOK_READ_STATE':
            case 'HOOK_COMPUTE':
                 // Handled by ConnectionOverlay for the beam
                 // Minimal pulse only
                 if (workInProgress) {
                     // Removed Pulse Explosion
                 }
                 break;

            case 'COMMIT_SYNC':
                // The BIG Swap
                // Removed Explosion
                break;

            case 'STACK_CLEANUP':
                // Removed Explosion
                break;
        }
    }, [currentStep, workInProgress, stepIndex]);

    return null; // Invisible director
};

// FX Implementation: Commit Sync (Shockwave)
const triggerCommitFX = () => {
    // Removed confetti explosion
    /*
    const phone = document.querySelector('#render-preview-container');
    if (phone) {
        // ... (removed confetti code)
    }
    */
};

const triggerSwapEffect = () => {
    // Visual "Swap" from Right (WIP) to Left (Current)
    const endX = 0.2; // Left side
    const startX = 0.8; // Right side
    const y = 0.5;

    // Single burst instead of loop to prevent chaos
    confetti({
        particleCount: 20,
        angle: 180, // Left
        spread: 20,
        origin: { x: startX, y: y },
        colors: ['#a855f7', '#fbbf24'],
        startVelocity: 45,
        gravity: 0.5,
        decay: 0.9,
        scalar: 1.0,
        drift: 0,
        ticks: 50
    });

    // Flash at destination
    setTimeout(() => {
        confetti({
            particleCount: 25,
            angle: 90,
            spread: 120, // Reduced spread
            origin: { x: endX, y: y },
            colors: ['#ffffff', '#a855f7'],
            startVelocity: 20,
            gravity: 0.8,
            decay: 0.85,
            ticks: 40
        });
    }, 400);
};

// FX Implementation: Stack Explosion (Shatter)
const triggerStackExplosion = () => {
    const stackFrame = document.querySelector('#current-stack-frame');

    let x = 0.3;
    let y = 0.8;

    if (stackFrame) {
        const rect = stackFrame.getBoundingClientRect();
        x = (rect.left + rect.width / 2) / window.innerWidth;
        y = (rect.top + rect.height / 2) / window.innerHeight;
    }

    // Single, cleaner burst
    confetti({
        particleCount: 25, // Reduced from 40
        spread: 90,
        origin: { x, y },
        colors: ['#a855f7', '#ffffff'],
        startVelocity: 30,
        gravity: 1.5,
        scalar: 0.8,
        shapes: ['square'],
        disableForReducedMotion: true,
        ticks: 45
    });
};

// FX Implementation: Cloning (Cell Division)
const triggerCloningEffect = () => {
    // Only trigger if we have a Current Tree to clone FROM
    // This prevents explosions on initial load (when there is no tree yet)
    const currentRoot = useStore.getState().currentRoot;
    if (!currentRoot) return;

    // We assume current tree exists at left.
    const startX = 0.2;
    const startY = 0.5;

    // Much subtler effect
    confetti({
        particleCount: 15, // Reduced from 30
        angle: 0, // Right
        spread: 30,
        origin: { x: startX, y: startY },
        colors: ['#22d3ee', '#e879f9'],
        startVelocity: 25,
        gravity: 0.5,
        decay: 0.92,
        ticks: 60
    });
};

const triggerNodePulse = (debugID: number) => {
    const node = document.querySelector(`#fiber-node-node-${debugID}`);
    if (node) {
        const rect = node.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 6, // Reduced from 10
            spread: 15,
            origin: { x, y },
            colors: ['#facc15'],
            startVelocity: 10,
            gravity: 0.5,
            scalar: 0.4,
            ticks: 20
        });
    }
};
