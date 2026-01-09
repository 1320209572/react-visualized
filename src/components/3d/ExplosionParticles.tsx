import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';

export const ExplosionParticles: React.FC<{ position: [number, number, number], color: string }> = ({ position, color }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const isMutating = useSimulationStore(s => s.isMutating);
    const count = 30;

    // Particle state
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.05 + Math.random() * 0.1;
            temp.push({
                velocity: new THREE.Vector3(Math.cos(angle) * speed, (Math.random() - 0.5) * speed, Math.sin(angle) * speed),
                rotation: new THREE.Vector3(Math.random() * 0.2, Math.random() * 0.2, Math.random() * 0.2),
                scale: 0.2 + Math.random() * 0.3,
                life: 1.0
            });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state, delta) => {
        if (!meshRef.current || !isMutating) return;

        let activeCount = 0;

        particles.forEach((particle, i) => {
            if (particle.life > 0) {
                // Physics
                particle.life -= delta * 1.5; // Fade out speed

                // Move
                dummy.position.set(
                    position[0] + particle.velocity.x * (1 - particle.life) * 10,
                    position[1] + particle.velocity.y * (1 - particle.life) * 10,
                    position[2] + particle.velocity.z * (1 - particle.life) * 10
                );

                // Rotate
                dummy.rotation.x += particle.rotation.x;
                dummy.rotation.y += particle.rotation.y;
                dummy.rotation.z += particle.rotation.z;

                // Scale (shrink)
                const s = particle.scale * particle.life;
                dummy.scale.set(s, s, s);

                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
                activeCount++;
            } else {
                 dummy.scale.set(0,0,0);
                 dummy.updateMatrix();
                 meshRef.current!.setMatrixAt(i, dummy.matrix);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (!isMutating) return null;

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0,0,0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
        </instancedMesh>
    );
};
