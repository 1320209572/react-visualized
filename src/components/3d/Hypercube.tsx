import React, { useRef } from 'react';
import { Box, Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { DesignTokens, SemanticColors } from '../../design/tokens';

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
        {/* The Glass Container - Professional Glassmorphism */}
        <Box ref={boxRef} args={[8, 6, 6]}>
            <meshPhysicalMaterial
                color={SemanticColors.hypercube.glass}
                transmission={DesignTokens.glass.transmission.high}
                opacity={DesignTokens.glass.opacity.high}
                metalness={DesignTokens.glass.material.metalness}
                roughness={DesignTokens.glass.material.roughness}
                ior={DesignTokens.glass.material.ior}
                thickness={DesignTokens.glass.material.thickness}
                transparent
                side={2}
            />
            <Edges
                scale={DesignTokens.spacing.edge.scale}
                threshold={15}
                color={SemanticColors.hypercube.edge}
                linewidth={DesignTokens.spacing.edge.linewidth}
            />
        </Box>

        {/* Floor Grid - Using design tokens */}
        <gridHelper
            args={[
                8,
                8,
                parseInt(SemanticColors.hypercube.grid.primary.replace('#', '0x')),
                parseInt(SemanticColors.hypercube.grid.secondary.replace('#', '0x'))
            ]}
            position={[0, -3, 0]}
        />

        {/* Internal Content */}
        {children}
    </group>
  );
};
