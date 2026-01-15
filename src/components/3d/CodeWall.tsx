import React, { useRef } from 'react';
import { Text, Plane, Box, Edges } from '@react-three/drei';
import { useSimulationStore } from '../../store/simulationStore';
import { DesignTokens, SemanticColors } from '../../design/tokens';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const CodeWall: React.FC = () => {
    const activeLine = useSimulationStore(s => s.activeLine); // 0-based line index to highlight
    const laserRef = useRef<any>(null);

    const codeLines = [
        "function Counter() {",
        "  const [count, setCount] = useState(0);",
        "  const handleClick = () => {",
        "    // 问题：闭包捕获 0",
        "    setCount(count + 1);",
        "    setCount(count + 1);",
        "    setCount(count + 1);",
        "  };",
        "  return <button>{count}</button>;",
        "}"
    ];

    // Calculate laser position
    const laserY = activeLine !== -1 ? 1.5 - activeLine * 0.35 : 0;

    // Laser Update
    useFrame(() => {
        if (laserRef.current && activeLine !== -1) {
            // Point from left code pane to stack center
            const start = new THREE.Vector3(1.9, -0.1, 0); // local to code wall
            const end = new THREE.Vector3(4.0, -0.6, 0); // toward stack

            // Native THREE.Line logic
            const positions = new Float32Array([
                start.x, start.y, start.z,
                end.x, end.y, end.z
            ]);
            laserRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            laserRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        // Left wall: glass code wall with scanner bar and laser
        <group position={[-3.5, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
            {/* Glass backing */}
            <Plane args={[3.8, 3.8]} position={[0, 0, 0]}>
                <meshPhysicalMaterial
                    color={SemanticColors.codeWall.background}
                    transparent
                    opacity={DesignTokens.glass.opacity.high}
                    roughness={DesignTokens.glass.material.roughness * 4.5}
                    metalness={DesignTokens.glass.material.metalness * 0.6}
                />
            </Plane>
            <Box args={[0.08, 3.9, 3.9]}>
                <meshPhysicalMaterial
                    color={SemanticColors.codeWall.border}
                    transparent
                    opacity={DesignTokens.glass.opacity.high * 0.25}
                />
                <Edges color={SemanticColors.codeWall.border} />
            </Box>

            {/* Header */}
            <Text
                position={[0, 2.05, 0]}
                fontSize={DesignTokens.typography.fontSize.xl}
                color={SemanticColors.codeWall.border}
                rotation={[0, 0, 0]}
                anchorX="center"
                anchorY="middle"
                outlineWidth={DesignTokens.typography.outline.standard}
                outlineColor={DesignTokens.colors.background.secondary}
            >
                Source Logic
            </Text>

            {/* Code lines */}
            <group position={[-1.7, 1.55, 0]}>
                {codeLines.map((line, index) => {
                    const isActive = activeLine === index;
                    return (
                        <group key={index} position={[0, -index * 0.33, 0]}>
                            {isActive && (
                                <group>
                                    <Box args={[3.3, 0.32, 0.05]} position={[1.65, -0.08, -0.05]}>
                                        <meshPhysicalMaterial
                                            color={SemanticColors.codeWall.activeLine}
                                            emissive={DesignTokens.colors.primary.light}
                                            emissiveIntensity={DesignTokens.emissive.strong}
                                            transmission={DesignTokens.glass.transmission.medium}
                                            thickness={DesignTokens.glass.material.thickness * 0.4}
                                            transparent
                                            opacity={DesignTokens.glass.opacity.medium + 0.1}
                                        />
                                        <Edges color={SemanticColors.codeWall.border} />
                                    </Box>
                                    <line ref={laserRef}>
                                        <bufferGeometry />
                                        <lineBasicMaterial
                                            color={DesignTokens.colors.accent2.purpleLight}
                                            transparent
                                            opacity={0.9}
                                            linewidth={2}
                                        />
                                    </line>
                                </group>
                            )}

                            <Text
                                fontSize={DesignTokens.typography.fontSize.base}
                                color={isActive ? DesignTokens.colors.text.primary : DesignTokens.colors.text.muted}
                                anchorX="left"
                                anchorY="top"
                            >
                                {line}
                            </Text>
                        </group>
                    );
                })}
            </group>
        </group>
    );
};
