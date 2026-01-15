import React from 'react';
import { Text, Plane, Box, Edges } from '@react-three/drei';
import { useSimulationStore } from '../../store/simulationStore';
import { DesignTokens, SemanticColors } from '../../design/tokens';

/**
 * Update Queue wall: glass shelf on the right inner wall, matching the reference
 * with thin orange outlines and stacked translucent cards.
 */
export const QueueRack: React.FC = () => {
    const queue = useSimulationStore(s => s.updateQueue);
    const collapseQueue = useSimulationStore(s => s.collapseQueue);
    const collapsing = useSimulationStore(s => s.collapsingQueue);

    const items = collapsing ? collapseQueue : queue;

    return (
        <group position={[3.8, 0, 0]}>
            {/* Backing glass panel */}
            <Plane args={[2.8, 4.7]} position={[0, -0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <meshPhysicalMaterial
                    color={SemanticColors.queueRack.background}
                    transparent
                    opacity={DesignTokens.glass.opacity.high * 0.56}
                    roughness={DesignTokens.glass.material.roughness * 4.5}
                    metalness={DesignTokens.glass.material.metalness * 0.6}
                />
            </Plane>
            <Box args={[0.05, 4.8, 2.8]} position={[0.03, -0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <meshPhysicalMaterial
                    color={SemanticColors.queueRack.border}
                    transparent
                    opacity={DesignTokens.glass.opacity.high * 0.31}
                />
                <Edges color={SemanticColors.queueRack.border} />
            </Box>

            {/* Header */}
            <Text
                position={[0.1, 2.35, 0]}
                fontSize={DesignTokens.typography.fontSize.xl + 0.02}
                color={SemanticColors.queueRack.border}
                rotation={[0, -Math.PI / 2, 0]}
                anchorX="center"
                anchorY="middle"
                outlineWidth={DesignTokens.typography.outline.standard}
                outlineColor={DesignTokens.colors.background.secondary}
            >
                Update Queue
            </Text>

            {/* Stack cards: thin cyan outlines, glassy interior */}
            {items.map((update, index) => {
                const y = -1.6 + index * 0.9;
                const activeCollapse = collapsing && index === 0;
                const scale = collapsing ? Math.max(0.05, 1 - index * 0.08) : 1;
                return (
                    <group key={update.id} position={[0.12, y, 0]} rotation={[0, -Math.PI / 2, 0]} scale={scale}>
                        <Box args={[0.06, 0.75, 2.2]}>
                            <meshPhysicalMaterial
                                color={SemanticColors.queueRack.card}
                                emissive={activeCollapse ? DesignTokens.colors.primary.light : SemanticColors.queueRack.cardEmissive}
                                emissiveIntensity={activeCollapse ? DesignTokens.emissive.normal : DesignTokens.emissive.subtle}
                                transmission={DesignTokens.glass.transmission.medium}
                                thickness={DesignTokens.glass.material.thickness}
                                roughness={DesignTokens.glass.material.roughness * 3}
                                transparent
                                opacity={DesignTokens.glass.opacity.high * 0.88}
                            />
                            <Edges color={DesignTokens.colors.primary.light} />
                        </Box>

                        {/* Upper row: sequence + snapshot/payload */}
                        <Text
                            position={[0.05, 0.16, 0]}
                            fontSize={DesignTokens.typography.fontSize.sm}
                            color={SemanticColors.queueRack.text}
                            anchorX="left"
                            anchorY="middle"
                        >
                            {`#${update.sequence ?? index + 1}  snap ${update.capturedValue}  ${update.type === 'constant' ? `payload ${update.value}` : 'fn: n=>n+1'}`}
                        </Text>
                        {/* Lower row: Chinese hint */}
                        <Text
                            position={[0.05, -0.12, 0]}
                            fontSize={DesignTokens.typography.fontSize.xs}
                            color={DesignTokens.colors.text.tertiary}
                            anchorX="left"
                            anchorY="middle"
                        >
                            {`队列包裹：${update.type === 'constant' ? '闭包 0 + 1' : '函数更新'}`}
                        </Text>
                    </group>
                );
            })}
        </group>
    );
};
