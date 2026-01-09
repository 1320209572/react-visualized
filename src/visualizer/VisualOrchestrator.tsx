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
    // Removed confetti explosion
    /*
    const endX = 0.2; // Left side
    const startX = 0.8; // Right side
    const y = 0.5;

    // ... (removed confetti code)
    */
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

    // Removed confetti explosion
    /*
    // We assume current tree exists at left.
    const startX = 0.2;
    const startY = 0.5;

    // ... (removed confetti code)
    */
};

const triggerNodePulse = (debugID: number) => {
    // Removed confetti explosion
    /*
    const node = document.querySelector(`#fiber-node-node-${debugID}`);
    if (node) {
        // ... (removed confetti code)
    }
    */
};
