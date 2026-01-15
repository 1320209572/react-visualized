import React, { useRef } from 'react';
import { Octahedron, Text, Ring, Plane, Box, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../store/simulationStore';
import { DesignTokens, SemanticColors } from '../../design/tokens';
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
                <meshBasicMaterial
                    color={SemanticColors.fiberFoundation.crystal}
                    transparent
                    opacity={DesignTokens.glass.opacity.high * 0.25}
                />
            </Plane>
            <Box args={[3.2, 0.05, 3.2]} position={[0, 0.03, 0]}>
                <meshPhysicalMaterial
                    color={DesignTokens.colors.primary.light}
                    transparent
                    opacity={DesignTokens.glass.opacity.high * 0.25}
                />
                <Edges color={DesignTokens.colors.primary.light} />
            </Box>

            {/* The Hook Crystal */}
            <group position={[0, 0.6, 0]}>
                <Octahedron ref={coreRef} args={[1.05, 0]}>
                     <meshBasicMaterial color={DesignTokens.colors.accent.cyanLight} wireframe />
                </Octahedron>

                {/* Inner Glow Core */}
                <Octahedron args={[0.55, 0]}>
                     <meshBasicMaterial
                        color={SemanticColors.fiberFoundation.crystal}
                        transparent
                        opacity={0.9}
                    />
                </Octahedron>

                {/* Data Projection (Floating Number) */}
                <Text
                    position={[0, 1.75, 0]}
                    fontSize={1.0}
                    color={isMutating ? DesignTokens.colors.accent3.orange : SemanticColors.fiberFoundation.crystal}
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={DesignTokens.typography.outline.standard}
                    outlineColor={DesignTokens.colors.background.secondary}
                >
                    {count}
                </Text>

                {/* Label */}
                <Text
                    position={[0, 2.6, 0]}
                    fontSize={DesignTokens.typography.fontSize.lg}
                    color={SemanticColors.fiberFoundation.text}
                    anchorX="center"
                >
                    FIBER HEAP / 堆内存
                </Text>

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
                <lineBasicMaterial
                    color={SemanticColors.fiberFoundation.crystal}
                    transparent
                    opacity={0.35}
                />
            </line>

            {/* Summary Hologram (front) */}
            {showSummary && (
                <group position={[0, 2.5, 2.5]}>
                    <Plane args={[6.5, 2.2]}>
                        <meshBasicMaterial
                            color={DesignTokens.colors.background.tertiary}
                            transparent
                            opacity={0.82}
                            side={2}
                        />
                    </Plane>
                    <Box args={[6.5, 2.2, 0.01]}>
                        <meshBasicMaterial transparent opacity={0} />
                        <Edges color={DesignTokens.colors.accent3.orange} />
                    </Box>
                    <Text
                        position={[0, 0, 0.1]}
                        fontSize={DesignTokens.typography.fontSize.lg + 0.04}
                        color={DesignTokens.colors.text.primary}
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
