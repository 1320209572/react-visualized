import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Octahedron, Ring, Box } from '@react-three/drei';
import { Mesh } from 'three';
import { useSimulationStore } from '../../store/simulationStore';

export const HookCrystal: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  const rippleRef = useRef<Mesh>(null);
  const count = useSimulationStore(s => s.count);
  const phase = useSimulationStore(s => s.phase);
  const lastRippleTimestamp = useSimulationStore(s => s.lastRippleTimestamp);
  const isMutating = useSimulationStore(s => s.isMutating);
  const pulseRef = useRef(0);

  // Trigger ripple animation
  useEffect(() => {
      if (lastRippleTimestamp > 0 && rippleRef.current) {
           // Reset and play
           rippleRef.current.scale.set(0.1, 0.1, 1);
           (rippleRef.current.material as any).opacity = 1;

           // Simple animation logic in useFrame will handle the expansion
           // We can use a custom property on the mesh to track animation state if needed
           // Or just set a "playing" flag ref
      }
  }, [lastRippleTimestamp]);

  // Pulse on count changes (commit)
  useEffect(() => {
      pulseRef.current = 1.0;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;

      // Subtle pulse on commit
      if (pulseRef.current > 0.01 || isMutating) {
          const factor = 1 + Math.max(pulseRef.current, 0.15);
          meshRef.current.scale.setScalar(factor);
          pulseRef.current *= 0.9;
      } else {
          meshRef.current.scale.setScalar(1);
      }
    }

    // Ripple Expansion
    if (rippleRef.current) {
        // If opaque enough, expand
        const material = rippleRef.current.material as any;
        if (material.opacity > 0.01) {
            rippleRef.current.scale.x += 0.05;
            rippleRef.current.scale.y += 0.05;
            material.opacity *= 0.95; // Fade out
        } else {
             material.opacity = 0;
        }
    }
  });

  return (
    <group position={[0, -2, 0]}>
        {/* Base Pedestal */}
        <Box args={[1.5, 0.2, 1.5]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color="#164e63" metalness={0.8} roughness={0.2} />
        </Box>

        {/* Ripple Ring */}
        <Ring ref={rippleRef} args={[1.2, 1.3, 32]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
            <meshBasicMaterial color="#22d3ee" transparent opacity={0} side={2} />
        </Ring>

        {/* The Memoized State Crystal - Floating Above Base */}
        <Octahedron ref={meshRef} args={[1, 0]} position={[0, 1.2, 0]}>
            <meshStandardMaterial
                color="#06b6d4" // Cyan
                emissive="#0891b2"
                emissiveIntensity={0.5}
                wireframe={true}
            />
        </Octahedron>
        {/* Inner Core */}
        <Octahedron args={[0.5, 0]} position={[0, 1.2, 0]}>
             <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
        </Octahedron>

        {/* Label */}
        <Text
            position={[0, -0.5, 0.8]}
            fontSize={0.2}
            color="#22d3ee"
            rotation={[-Math.PI / 4, 0, 0]}
        >
            FIBER HEAP / Fiber 堆
        </Text>

        {/* Value Display */}
        <Text
            position={[0, 1.2, 1.2]}
            fontSize={0.4}
            color="#ecfeff"
            outlineWidth={0.015}
            outlineColor="#0ea5e9"
        >
            {count}
        </Text>

        {/* Memory Address Tag */}
        <Text
            position={[1.2, 1.7, 0]}
            fontSize={0.1}
            color="#67e8f9"
            rotation={[0, -0.5, 0]}
        >
            0x7f...hook0
        </Text>
    </group>
  );
};
