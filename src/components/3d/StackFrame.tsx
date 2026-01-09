import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Edges } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import { useSimulationStore } from '../../store/simulationStore';

export const StackFrame: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  const count = useSimulationStore(s => s.count);
  const phase = useSimulationStore(s => s.phase);
  const snapshotValue = useSimulationStore(s => s.snapshotValue);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating
      meshRef.current.position.y = 3.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;

      // Boom / Destruction Animation
      if (phase === 'COMMIT') {
           meshRef.current.scale.lerp(new Vector3(0, 0, 0), 0.1);
           (meshRef.current.material as any).opacity = 0;
      } else {
           meshRef.current.scale.lerp(new Vector3(1, 1, 1), 0.1);
           // Restore opacity if not committing
           if (!isLocked) (meshRef.current.material as any).opacity = 0.3;
           else (meshRef.current.material as any).opacity = 0.5;
      }
    }
  });

  const isLocked = snapshotValue !== null;

  return (
    <group position={[0, 0, 0]}> {/* Position handled by Y offset in loop or parent */}
        {/* The Execution Context Box */}
        <Box ref={meshRef} args={[3, 1.5, 0.5]} position={[0, 3.5, 0]}>
            <meshPhysicalMaterial
                color={isLocked ? "#0ea5e9" : "#a855f7"} // Stronger Cyan-Blue when locked
                emissive={isLocked ? "#0ea5e9" : "#000000"}
                emissiveIntensity={isLocked ? 0.5 : 0}
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.5}
                transmission={0.5}
                thickness={1}
            />
            {/* Edge Highlights */}
            <Edges
                color={isLocked ? "#bae6fd" : "#d8b4fe"}
                threshold={15} // Show more edges
            />

            {/* Inner Content attached to the box so it scales with it */}
            <group position={[0, 0, 0]}>
                {/* Label: Component Name */}
                <Text
                    position={[-1.2, 0.9, 0]}
                    fontSize={0.2}
                    color={isLocked ? "#7dd3fc" : "#d8b4fe"}
                    anchorX="left"
                >
                    {'<Counter />'}
                </Text>

                {/* Variable Visualization (Closure Scope) */}
                <group position={[0, 0, 0.3]}>
                    <Text
                        position={[-0.8, 0.2, 0]}
                        fontSize={0.15}
                        color="white"
                        anchorX="left"
                    >
                        const count =
                    </Text>
                    <Text
                        position={[0.5, 0.2, 0]}
                        fontSize={0.3}
                        color={isLocked ? '#38bdf8' : 'white'}
                        outlineWidth={isLocked ? 0.01 : 0}
                        outlineColor="#0ea5e9"
                    >
                        {/* If locked, show snapshot value, else current global count */}
                        {isLocked ? snapshotValue : count}
                    </Text>

                    {/* Snapshot Tag - Prominent */}
                    {isLocked && (
                        <Text
                            position={[0, -0.3, 0]}
                            fontSize={0.12}
                            color="#bae6fd" // Light Blue
                            anchorX="center"
                        >
                            Snapshot: {snapshotValue}
                        </Text>
                    )}
                </group>
            </group>
        </Box>
    </group>
  );
};
