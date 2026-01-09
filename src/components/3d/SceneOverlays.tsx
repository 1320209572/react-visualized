import React from 'react';
import { Text, Box, Edges, Plane } from '@react-three/drei';
import { QuadraticBezierLine } from '@react-three/drei';
import { useSimulationStore } from '../../store/simulationStore';

/**
 * High-level labels and callouts to mirror the diagram:
 * - Top hook badges (ustate / count snapshot)
 * - Big queue result pill
 * - Loop arrow inside queue
 * - Red reconciliation arrow
 */
export const SceneOverlays: React.FC = () => {
    const count = useSimulationStore(s => s.count);
    const snapshot = useSimulationStore(s => s.snapshotValue);
    const lastRun = useSimulationStore(s => s.lastRun);
    const phase = useSimulationStore(s => s.phase);

    const snapshotValue = snapshot ?? lastRun?.captured ?? 0;
    const resultValue = phase === 'COMMIT' ? count : (lastRun?.committed ?? count);

    return (
        <group>
            {/* Top hook badges */}
            <group position={[0, 2.9, -1.3]}>
                <Badge text="ustate(0)" width={1.4} />
                <group position={[0, -0.45, 0]}>
                    <Badge text={`count = ${snapshotValue}`} width={1.6} />
                </group>
                <group position={[0, -0.95, 0]}>
                    <Badge text={`count ≤ 0`} width={1.6} />
                </group>
            </group>

            {/* Queue result pill */}
            <group position={[3.2, 0.6, 0]}>
                <Box args={[0.08, 0.9, 2.4]}>
                    <meshPhysicalMaterial
                        color="#0ea5e9"
                        emissive="#38bdf8"
                        emissiveIntensity={0.35}
                        transmission={0.75}
                        thickness={0.6}
                        roughness={0.1}
                        transparent
                        opacity={0.28}
                    />
                    <Edges color="#38bdf8" />
                </Box>
                <Text
                    position={[0.05, 0.1, 0]}
                    fontSize={0.38}
                    color="#e0f2fe"
                    anchorX="center"
                    anchorY="middle"
                >
                    {resultValue}
                </Text>
                <Text
                    position={[0.05, -0.25, 0]}
                    fontSize={0.16}
                    color="#e2e8f0"
                    anchorX="center"
                    anchorY="middle"
                >
                    {`count 新 0 差 ${resultValue}`}
                </Text>
            </group>

            {/* Queue loop arrow (cyan) */}
            <QuadraticBezierLine
                start={[2.8, -0.9, 0.6]}
                end={[2.8, 1.2, -0.4]}
                mid={[3.4, 0.1, 0.4]}
                color="#22d3ee"
                lineWidth={2}
                transparent
                opacity={0.5}
            />

            {/* Reconciliation arrow (red) */}
            <QuadraticBezierLine
                start={[2.6, 0.2, 0]}
                end={[0.4, 0.0, 0]}
                mid={[1.6, 0.4, 0.1]}
                color="#ef4444"
                lineWidth={2.5}
                transparent
                opacity={0.8}
            />
        </group>
    );
};

const Badge = ({ text, width = 1.4 }: { text: string; width?: number }) => (
    <group>
        <Box args={[0.06, 0.28, width]}>
            <meshPhysicalMaterial
                color="#22d3ee"
                emissive="#22d3ee"
                emissiveIntensity={0.25}
                transmission={0.8}
                thickness={0.5}
                roughness={0.1}
                transparent
                opacity={0.2}
            />
            <Edges color="#38bdf8" />
        </Box>
        <Text
            position={[0.05, 0, 0]}
            fontSize={0.14}
            color="#e2e8f0"
            anchorX="center"
            anchorY="middle"
        >
            {text}
        </Text>
    </group>
);
