import React from 'react';
import { Text, Plane, Box, Edges } from '@react-three/drei';
import { useSimulationStore } from '../../store/simulationStore';

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
                    color="#0b0b10"
                    transparent
                    opacity={0.18}
                    roughness={0.18}
                    metalness={0.05}
                />
            </Plane>
            <Box args={[0.05, 4.8, 2.8]} position={[0.03, -0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
                <meshPhysicalMaterial color="#22d3ee" transparent opacity={0.1} />
                <Edges color="#22d3ee" />
            </Box>

            {/* Header */}
            <Text
                position={[0.1, 2.35, 0]}
                fontSize={0.26}
                color="#22d3ee"
                rotation={[0, -Math.PI / 2, 0]}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#0b0b0f"
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
                                color="#0ea5e9"
                                emissive={activeCollapse ? "#38bdf8" : "#0ea5e9"}
                                emissiveIntensity={activeCollapse ? 0.35 : 0.18}
                                transmission={0.7}
                                thickness={0.5}
                                roughness={0.12}
                                transparent
                                opacity={0.28}
                            />
                            <Edges color="#38bdf8" />
                        </Box>

                        {/* Upper row: sequence + snapshot/payload */}
                        <Text
                            position={[0.05, 0.16, 0]}
                            fontSize={0.14}
                            color="#e2e8f0"
                            anchorX="left"
                            anchorY="middle"
                        >
                            {`#${update.sequence ?? index + 1}  snap ${update.capturedValue}  ${update.type === 'constant' ? `payload ${update.value}` : 'fn: n=>n+1'}`}
                        </Text>
                        {/* Lower row: Chinese hint */}
                        <Text
                            position={[0.05, -0.12, 0]}
                            fontSize={0.12}
                            color="#cbd5e1"
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
