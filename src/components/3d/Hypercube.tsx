import React, { useRef } from 'react';
import { Box, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export const Hypercube: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const boxRef = useRef<any>(null);

  useFrame((state) => {
    // Subtle breathing animation
    if (boxRef.current) {
         // boxRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
    }
  });

  return (
    <group>
        {/* The Glass Container - RESTORED GLASS MATERIAL */}
        <Box ref={boxRef} args={[8, 6, 6]}>
            <meshPhysicalMaterial
                color="#67e8f9" // brighter cyan
                transmission={0.95} // High transparency
                opacity={0.32}
                metalness={0.08}
                roughness={0.04}
                ior={1.5}
                thickness={0.5}
                transparent
                side={2}
            />
            <Edges
                scale={1}
                threshold={15}
                color="#22d3ee" // Cyan Neon
                linewidth={2.5}
            />
        </Box>

        {/* Floor Grid */}
        <gridHelper args={[8, 8, 0x1f2937, 0x0b1220]} position={[0, -3, 0]} />

        {/* Internal Content */}
        {children}
    </group>
  );
};
