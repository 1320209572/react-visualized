import React, { useRef } from 'react';
import { Text, Box, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../store/simulationStore';
import { ExplosionParticles } from './ExplosionParticles';
import { DesignTokens, SemanticColors } from '../../design/tokens';
import * as THREE from 'three';

export const StackRail: React.FC = () => {
    const stackSlots = useSimulationStore(s => s.stackSlots || []);
    const isMutating = useSimulationStore(s => s.isMutating);

    return (
        <group position={[0, 0, 0]}>
            {/* Header */}
            <Text
                position={[0, 2.6, 0]}
                fontSize={DesignTokens.typography.fontSize.xl + 0.02}
                color={SemanticColors.stackRail.frame}
                anchorX="center"
                outlineWidth={DesignTokens.typography.outline.thick}
                outlineColor={DesignTokens.colors.background.secondary}
            >
                Execution Stack
            </Text>

            {/* Single visible frame (show only latest) */}
            {stackSlots.slice(0, 1).map((slot, index) => (
                <StackFrameSlice key={slot.id} slot={slot} index={index} />
            ))}

            {/* Explosion Effect on Commit */}
            {isMutating && (
                <ExplosionParticles position={[0, 1.5, 0]} color={SemanticColors.stackRail.frame} />
            )}

            {/* HandleClick floating label */}
            <Text
                position={[1.8, 0.6, 0]}
                fontSize={DesignTokens.typography.fontSize.lg}
                color={SemanticColors.stackRail.label}
                anchorX="left"
                anchorY="middle"
                outlineWidth={DesignTokens.typography.outline.standard}
                outlineColor={DesignTokens.colors.background.secondary}
            >
                handleClick()
            </Text>
        </group>
    );
};

const StackFrameSlice: React.FC<{ slot: any, index: number }> = ({ slot, index }) => {
    const meshRef = useRef<any>(null);

    useFrame((state) => {
        if (slot.isLocked && meshRef.current) {
            // High frequency glitch
            meshRef.current.position.x = (Math.random() - 0.5) * 0.05;
        }
    });

    return (
        <group position={[0, 1.4 - index * 1.5, 0]}>
            {/* Glass Slab */}
            <Box args={[3.4, 1.1, 0.18]}>
                <meshPhysicalMaterial
                    color={slot.isLocked ? SemanticColors.stackRail.locked : SemanticColors.stackRail.frame}
                    emissive={slot.isLocked ? SemanticColors.stackRail.lockedEmissive : SemanticColors.stackRail.frameEmissive}
                    emissiveIntensity={slot.isLocked ? DesignTokens.emissive.strong : DesignTokens.emissive.normal}
                    transmission={DesignTokens.glass.transmission.low}
                    thickness={DesignTokens.glass.material.thickness * 1.2}
                    roughness={DesignTokens.glass.material.roughness * 2.5}
                    transparent
                    opacity={slot.isLocked ? DesignTokens.glass.opacity.low : (DesignTokens.glass.opacity.medium + 0.32)}
                />
                <Edges color={slot.isLocked ? DesignTokens.colors.warning.redLight : DesignTokens.colors.accent2.purpleLight} />
            </Box>

            {/* Slots */}
            <group position={[-1.1, 0.1, 0.14]}>
                <Text
                    fontSize={DesignTokens.typography.fontSize.lg}
                    color={SemanticColors.stackRail.text}
                    anchorX="left"
                >
                    count
                </Text>
                <Text
                    fontSize={DesignTokens.typography.fontSize.xxxl}
                    color={DesignTokens.colors.text.primary}
                    anchorX="left"
                    position={[1.2, 0, 0]}
                >
                    {slot.value}
                </Text>
            </group>
            <group position={[-1.1, -0.25, 0.14]}>
                <Text
                    fontSize={DesignTokens.typography.fontSize.base}
                    color={SemanticColors.stackRail.label}
                    anchorX="left"
                >
                    setCount
                </Text>
                <Text
                    fontSize={DesignTokens.typography.fontSize.base}
                    color={DesignTokens.colors.accent2.purpleLight}
                    anchorX="left"
                    position={[1.2, 0, 0]}
                >
                    {'()=>dispatch'}
                </Text>
            </group>

            {/* Locked badge */}
            {slot.isLocked && (
                <Text
                    position={[0, 0.75, 0]}
                    fontSize={DesignTokens.typography.fontSize.base}
                    color={DesignTokens.colors.warning.redLight}
                    anchorX="center"
                    outlineWidth={DesignTokens.typography.outline.standard}
                    outlineColor={DesignTokens.colors.background.secondary}
                >
                    LOCKED SNAPSHOT
                </Text>
            )}
        </group>
    );
}
