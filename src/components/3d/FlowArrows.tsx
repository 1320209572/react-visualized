import React from 'react';
import { QuadraticBezierLine } from '@react-three/drei';
import { useSimulationStore } from '../../store/simulationStore';
import * as THREE from 'three';

export const FlowArrows: React.FC = () => {
    // Permanent visual guides connecting the modules

    return (
        <group>
            {/* Arrow 1: Code to Stack (Implicit, covered by Laser usually, but let's add a static faint guide) */}
            <QuadraticBezierLine
                start={[-1.5, 0.5, 0]} // Code
                end={[0, 1.0, 0]} // Stack Top
                mid={[-0.75, 1.5, 0]}
                color="#a855f7"
                lineWidth={1}
                transparent
                opacity={0.1}
                dashed
            />

            {/* Arrow 2: Stack to Queue (The Update Path) */}
            <QuadraticBezierLine
                start={[1.5, 1.0, 0]} // Stack Right
                end={[3.5, -0.5, 0]} // Queue Top
                mid={[2.5, 1.0, 0]}
                color="#f97316"
                lineWidth={2}
                transparent
                opacity={0.2}
            />

            {/* Arrow 3: Queue to Heap (The Commit Path) */}
            <QuadraticBezierLine
                start={[3.5, -3.0, 0]} // Queue Bottom
                end={[0.5, -3.5, 0]} // Heap Crystal Right
                mid={[2.0, -4.0, 0]}
                color="#22d3ee"
                lineWidth={2}
                transparent
                opacity={0.2}
            />

            {/* Arrow 4: Heap to Stack (The Read Path) */}
             <QuadraticBezierLine
                start={[-0.5, -3.5, 0]} // Heap Crystal Left
                end={[-1.5, 0.5, 0]} // Stack Left/Code area
                mid={[-2.0, -2.0, 0]}
                color="#06b6d4"
                lineWidth={1}
                transparent
                opacity={0.1}
                dashed
            />
        </group>
    );
};
