import React, { useEffect, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../store/simulationStore';
import * as THREE from 'three';

export const SpatialNarrative: React.FC = () => {
    const narrative = useSimulationStore(s => s.narrative);
    const [displayNarrative, setDisplayNarrative] = useState(narrative);
    const [opacity, setOpacity] = useState(0);
    const [targetOpacity, setTargetOpacity] = useState(0);

    useEffect(() => {
        if (narrative) {
            setDisplayNarrative(narrative);
            setTargetOpacity(1);
        } else {
            setTargetOpacity(0);
        }
    }, [narrative]);

    useFrame((state, delta) => {
        // Smooth fade transition
        const speed = 2.0;
        if (opacity !== targetOpacity) {
            let newOpacity = opacity + (targetOpacity - opacity) * speed * delta;
            if (Math.abs(targetOpacity - newOpacity) < 0.01) newOpacity = targetOpacity;
            setOpacity(newOpacity);
        }
    });

    if (!displayNarrative && opacity <= 0.01) return null;

    return (
        <group position={[0, 0.5, 3]}> {/* Move forward in Z and slightly up so it floats in front of the action, not inside objects */}
            <Text
                position={[0, 0, 0]}
                fontSize={0.25}
                color="#facc15" // Yellow
                fillOpacity={opacity}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
                outlineOpacity={opacity}
            >
                {displayNarrative}
            </Text>
        </group>
    );
};
