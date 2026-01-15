import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Text, Line, Box, Edges } from '@react-three/drei';
import { Vector3, Group } from 'three';
import { useSimulationStore } from '../../store/simulationStore';
import { SemanticColors } from '../../design/tokens';

export const DataPhoton: React.FC = () => {
  const activePhoton = useSimulationStore(s => s.activePhoton);
  const onPhotonArrival = useSimulationStore(s => s.onPhotonArrival);

  const groupRef = useRef<Group>(null);
  const lineGeoRef = useRef<any>(null); // Ref for BufferGeometry
  const [progress, setProgress] = useState(0);

  // Reset when a new photon appears
  useEffect(() => {
    if (activePhoton) {
        setProgress(0);
    }
  }, [activePhoton?.id]);

  // Main Physics Loop (Movement)
  useFrame((_, delta) => {
    if (!activePhoton || !groupRef.current) return;

    if (progress < 1) {
        const newProgress = Math.min(progress + delta * 0.8, 1);
        setProgress(newProgress);

        const t = newProgress;
        // Path: Stack Slot (Center) -> Queue Wall (Right)
        const p0 = new Vector3(0, 1.4, 0);
        const p1 = new Vector3(1.8, 1.9, 0.2);
        const p2 = new Vector3(3.4, 1.0, 0); // Hits the Queue Wall

        const pos = new Vector3()
            .copy(p0).multiplyScalar((1-t)*(1-t))
            .add(p1.multiplyScalar(2*(1-t)*t))
            .add(p2.multiplyScalar(t*t));

        groupRef.current.position.copy(pos);

        if (newProgress >= 1) {
            onPhotonArrival();
        }
    }
  });

  // Laser Line Update Loop
  useFrame(() => {
      if (activePhoton && lineGeoRef.current && groupRef.current) {
          const worldPhoton = groupRef.current.position.clone();
          // Calculate relative vector from photon back to stack
          const relStack = new Vector3(0, 1.5, 0).sub(worldPhoton);
          lineGeoRef.current.setFromPoints([new Vector3(0,0,0), relStack]);
      }
  });

  if (!activePhoton) return null;

  const label = activePhoton.payload.type === 'constant'
    ? `snap ${activePhoton.payload.capturedValue} → ${activePhoton.payload.value}`
    : `fn n=>n+1 (snap ${activePhoton.payload.capturedValue})`;

  return (
    <group ref={groupRef}>
        <Trail width={0.4} length={8} color={SemanticColors.dataPhoton.trail} attenuation={(t) => t * t}>
            <Sphere args={[0.14, 16, 16]}>
                <meshBasicMaterial color={SemanticColors.dataPhoton.core} transparent opacity={0.85} />
            </Sphere>
            <Box args={[0.28, 0.28, 0.28]}>
                <meshBasicMaterial transparent opacity={0} />
                <Edges color={SemanticColors.dataPhoton.core} scale={1.0} />
            </Box>
        </Trail>

        {/* Visual Alignment Laser Line */}
        {progress < 0.95 && (
             <line>
                <bufferGeometry ref={lineGeoRef} />
                <lineBasicMaterial
                    color={SemanticColors.dataPhoton.text}
                    transparent
                    opacity={0.35 * (1 - progress)}
                />
             </line>
        )}

        <Text
            position={[0, 0.6, 0]}
            fontSize={0.25}
            color={SemanticColors.dataPhoton.core}
            anchorX="center"
            anchorY="bottom"
            // Font removed for stability
        >
            {label}
        </Text>
    </group>
  );
};
