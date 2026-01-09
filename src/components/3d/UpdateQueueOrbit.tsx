import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../store/simulationStore';
import { Sphere, Line, Text, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

export const UpdateQueueOrbit: React.FC = () => {
    const updateQueue = useSimulationStore(s => s.updateQueue);
    const groupRef = useRef<THREE.Group>(null);

    // Orbit parameters
    const RADIUS = 2.5;

    useFrame((state) => {
        if (groupRef.current) {
            // Rotate the entire satellite system
            groupRef.current.rotation.y += 0.005;
        }
    });

    // Create a circular path for visual reference
    const orbitPath = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS));
        }
        return points;
    }, []);

    if (updateQueue.length === 0) return null;

    // Calculate positions for linkage visualization
    const satellites = updateQueue.map((update, index) => {
        const theta = (index / Math.max(updateQueue.length, 1)) * Math.PI * 2;
        const x = Math.cos(theta) * RADIUS;
        const z = Math.sin(theta) * RADIUS;
        return { ...update, pos: new THREE.Vector3(x, 0, z), theta };
    });

    return (
        <group position={[0, -1.2, 0]} ref={groupRef}> {/* Lifted from -2 to -1.2 to clear the base */}
            {/* The Orbit Ring */}
            <Line points={orbitPath} color="#0891b2" opacity={0.3} transparent lineWidth={1} />

            {/* Text Label */}
             <Text
                position={[RADIUS + 0.5, 0, 0]}
                fontSize={0.15}
                color="#06b6d4"
                anchorX="left"
                rotation={[0, -Math.PI/2, 0]}
            >
                PENDING QUEUE ({updateQueue.length})
            </Text>

            {/* Linkage Beams (Functional Updates Only) */}
            {satellites.map((sat, i) => {
                if (i === 0) return null; // First one has no previous in this batch context
                const prev = satellites[i-1];

                // Only draw link if THIS one is functional (implies it reads prev)
                if (sat.type === 'function') {
                    // Curved beam
                    const mid = new THREE.Vector3().addVectors(prev.pos, sat.pos).multiplyScalar(0.8);
                    const points = [prev.pos, mid, sat.pos];

                    return (
                        <group key={`link-${sat.id}`}>
                            <Line
                                points={points}
                                color="#22d3ee"
                                lineWidth={2}
                                transparent
                                opacity={0.6}
                            />
                            {/* Animated Pulse on Link */}
                            {/* (Simplified: Static beam for now to ensure stability) */}
                        </group>
                    )
                }
                return null;
            })}

            {/* Satellite Nodes (Pending Updates) */}
            {satellites.map((sat) => {
                const isFunction = sat.type === 'function';

                return (
                    <group key={sat.id} position={sat.pos} rotation={[0, -sat.theta, 0]}>
                         {isFunction ? (
                             // Function: Prism / Octahedron
                             <group>
                                <Octahedron args={[0.2, 0]}>
                                    <meshStandardMaterial
                                        color="#22d3ee"
                                        emissive="#22d3ee"
                                        emissiveIntensity={1}
                                        wireframe
                                    />
                                </Octahedron>
                                <Octahedron args={[0.1, 0]}>
                                    <meshBasicMaterial color="#ffffff" />
                                </Octahedron>
                             </group>
                         ) : (
                             // Constant: Sphere
                             <Sphere args={[0.15, 16, 16]}>
                                <meshStandardMaterial
                                    color="#fbbf24"
                                    emissive="#fbbf24"
                                    emissiveIntensity={0.8}
                                />
                             </Sphere>
                         )}

                         {/* Mini connection line to center */}
                         <Line
                            points={[[0,0,0], [-0.5, 0, 0]]}
                            color={isFunction ? "#22d3ee" : "#fbbf24"}
                            transparent
                            opacity={0.5}
                         />

                         {/* Value Label */}
                         <Text position={[0, 0.35, 0]} fontSize={0.12} color="white">
                             {sat.displayValue}
                         </Text>
                    </group>
                );
            })}
        </group>
    );
};
