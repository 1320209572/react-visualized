import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';

export const CommitBeams: React.FC = () => {
    const isMutating = useSimulationStore(s => s.isMutating);
    const updateQueue = useSimulationStore(s => s.updateQueue); // This gets cleared instantly on commit, so we might miss it.

    // We need to capture the queue positions *before* it clears, or just hardcode the positions since we know where they stack.
    // Actually, simulationStore clears updateQueue *inside* commitUpdates.
    // So by the time isMutating is true, updateQueue is empty.

    // Strategy: Just emit beams from the known Rack positions to the Center.

    const beamsRef = useRef<THREE.InstancedMesh>(null);
    const count = 3; // Max 3 items usually

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const target = new THREE.Vector3(0, -3, 0); // Heap Crystal

    useFrame((state) => {
        if (!beamsRef.current || !isMutating) return;

        // Animate beams flowing from Right (3, -1.5..0, 0) to Center (0, -3, 0)
        for(let i=0; i<count; i++) {
             const startPos = new THREE.Vector3(3.5, -2 + i * 0.8, 0);
             const t = (state.clock.elapsedTime * 2 + i * 0.2) % 1;

             const currentPos = new THREE.Vector3().lerpVectors(startPos, target, t);

             dummy.position.copy(currentPos);
             dummy.scale.setScalar(1 - t); // Shrink as they approach
             dummy.updateMatrix();
             beamsRef.current.setMatrixAt(i, dummy.matrix);
        }
        beamsRef.current.instanceMatrix.needsUpdate = true;
    });

    if (!isMutating) return null;

    return (
        <instancedMesh ref={beamsRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
        </instancedMesh>
    );
};
