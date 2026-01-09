import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Hypercube } from './Hypercube';
import { CodeWall } from './CodeWall';
import { StaticBlueprint } from './StaticBlueprint';

export const GenesisScene: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#020617]">
        <Canvas
            orthographic // <--- CRITICAL: Switch to Orthographic for Isometric look
            camera={{ position: [20, 20, 20], zoom: 40, near: -50, far: 200 }}
            gl={{
                powerPreference: "high-performance",
                antialias: true,
                preserveDrawingBuffer: true
            }}
            dpr={[1, 2]}
        >
            <color attach="background" args={['#020617']} />

            {/* Flat, Tech Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={2} color="#22d3ee" />

            <group rotation={[0, -Math.PI / 4, 0]}> {/* Rotate scene to match isometric angle */}
                <Hypercube>
                    <StaticBlueprint />
                </Hypercube>
            </group>

            <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={2} />
            </EffectComposer>

            <OrbitControls
                enableZoom={true}
                enablePan={true}
                minZoom={20}
                maxZoom={100}
            />
        </Canvas>
    </div>
  );
};
