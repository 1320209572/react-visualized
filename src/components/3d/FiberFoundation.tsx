import React, { useRef } from 'react';
import { Octahedron, Text, Ring, Plane, Box, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../store/simulationStore';
import * as THREE from 'three';

export const FiberFoundation: React.FC = () => {
    const coreRef = useRef<any>(null);
    const count = useSimulationStore(s => s.count);
    const isMutating = useSimulationStore(s => s.isMutating);
    const showSummary = useSimulationStore(s => s.showSummary);
    const summaryText = useSimulationStore(s => s.summaryText);

    useFrame((state) => {
        if (coreRef.current) {
            coreRef.current.rotation.y += 0.018;
            if (isMutating) {
                coreRef.current.rotation.x += 0.08;
                coreRef.current.scale.lerp(new THREE.Vector3(1.35, 1.35, 1.35), 0.12);
            } else {
                coreRef.current.rotation.x = 0;
                coreRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }
    });

    return (
        <group position={[0, -3.4, 0]}>
            {/* Floor glow pad */}
            <Plane args={[3.4, 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#0ea5e9" transparent opacity={0.08} />
            </Plane>
            <Box args={[3.2, 0.05, 3.2]} position={[0, 0.03, 0]}>
                <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.08} />
                <Edges color="#38bdf8" />
            </Box>

            {/* The Hook Crystal */}
            <group position={[0, 0.6, 0]}>
                <Octahedron ref={coreRef} args={[1.05, 0]}>
                     <meshBasicMaterial color="#7dd3fc" wireframe />
                </Octahedron>

                {/* Inner Glow Core */}
                <Octahedron args={[0.55, 0]}>
                     <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} />
                </Octahedron>

                {/* Data Projection (Floating Number) */}
                <Text
                    position={[0, 1.75, 0]}
                    fontSize={1.0}
                    color={isMutating ? "#fbbf24" : "#22d3ee"}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#0b0b0f"
                >
                    {count}
                </Text>

                {/* Label */}
                <Text
                    position={[0, 2.6, 0]}
                    fontSize={0.18}
                    color="#67e8f9"
                    anchorX="center"
                >
                    FIBER HEAP / 堆内存
                </Text>
            </group>

            {/* Energy Tether to Stack - Thin Line */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([0, 0, 0, 0, 4, 0])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#22d3ee" transparent opacity={0.35} />
            </line>

            {/* Summary Hologram (front) */}
            {showSummary && (
                <group position={[0, 2.5, 2.5]}>
                    <Plane args={[6.5, 2.2]}>
                        <meshBasicMaterial color="#000000" transparent opacity={0.82} side={2} />
                    </Plane>
                    <Box args={[6.5, 2.2, 0.01]}>
                        <meshBasicMaterial transparent opacity={0} />
                        <Edges color="#facc15" />
                    </Box>
                    <Text
                        position={[0, 0, 0.1]}
                        fontSize={0.22}
                        color="#ffffff"
                        maxWidth={5.8}
                        textAlign="center"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {summaryText}
                    </Text>
                </group>
            )}
        </group>
    );
};
