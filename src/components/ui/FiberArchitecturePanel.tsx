import React, { useMemo, useRef } from 'react';
import { GitBranch } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Points, PointMaterial, Edges, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';

type TreeNode = {
    id: string;
    label: string;
    pos: [number, number, number];
};

type TreeEdge = { from: string; to: string; kind: 'child' | 'return' | 'sibling' };

export const FiberArchitecturePanel: React.FC = () => {
    // Dense vertical stacks (~16 nodes) to match reference
    const baseNodes: TreeNode[] = [
        // Slight Z staggering to avoid “flat” look (front/back drift)
        { id: 'n1', label: 'ROOT', pos: [0, 2.65, 0.15] },
        { id: 'n2', label: '', pos: [0.05, 2.25, 0.05] },
        { id: 'n3', label: 'APP', pos: [-0.1, 1.85, 0.12] },
        { id: 'n4', label: '', pos: [0.2, 1.75, -0.05] },
        { id: 'n5', label: 'NAV', pos: [-0.9, 1.28, 0.08] },
        { id: 'n6', label: '', pos: [-0.35, 1.25, -0.08] },
        { id: 'n7', label: 'MAIN', pos: [0.35, 1.25, 0.06] },
        { id: 'n8', label: '', pos: [0.95, 1.22, -0.06] },
        { id: 'n9', label: 'BTN', pos: [-1.15, 0.72, 0.02] },
        { id: 'n10', label: 'IMG', pos: [-0.48, 0.68, -0.1] },
        { id: 'n11', label: 'TXT', pos: [0.52, 0.7, 0.02] },
        { id: 'n12', label: 'LIST', pos: [1.16, 0.66, -0.1] },
        { id: 'n13', label: '', pos: [-0.82, 0.08, 0.06] },
        { id: 'n14', label: '', pos: [-0.12, 0.06, -0.06] },
        { id: 'n15', label: '', pos: [0.62, 0.06, 0.04] },
        { id: 'n16', label: '', pos: [1.32, 0.04, -0.04] },
    ];

    const edges: TreeEdge[] = [
        { from: 'n1', to: 'n2', kind: 'child' },
        { from: 'n2', to: 'n3', kind: 'child' },
        { from: 'n2', to: 'n4', kind: 'child' },
        { from: 'n3', to: 'n5', kind: 'child' },
        { from: 'n3', to: 'n6', kind: 'child' },
        { from: 'n4', to: 'n7', kind: 'child' },
        { from: 'n4', to: 'n8', kind: 'child' },
        { from: 'n5', to: 'n9', kind: 'child' },
        { from: 'n6', to: 'n10', kind: 'child' },
        { from: 'n7', to: 'n11', kind: 'child' },
        { from: 'n8', to: 'n12', kind: 'child' },
        { from: 'n9', to: 'n13', kind: 'child' },
        { from: 'n10', to: 'n14', kind: 'child' },
        { from: 'n11', to: 'n15', kind: 'child' },
        { from: 'n12', to: 'n16', kind: 'child' },
        // returns: upward hints
        { from: 'n2', to: 'n1', kind: 'return' },
        { from: 'n3', to: 'n2', kind: 'return' },
        { from: 'n4', to: 'n2', kind: 'return' },
        { from: 'n5', to: 'n3', kind: 'return' },
        { from: 'n6', to: 'n3', kind: 'return' },
        { from: 'n7', to: 'n4', kind: 'return' },
        { from: 'n8', to: 'n4', kind: 'return' },
        // sibling cross hints
        { from: 'n5', to: 'n7', kind: 'sibling' },
        { from: 'n9', to: 'n11', kind: 'sibling' },
        { from: 'n13', to: 'n15', kind: 'sibling' },
    ];

    const leftNodes = useMemo(
        () => baseNodes.map(n => ({ ...n, pos: [n.pos[0] - 2.2, n.pos[1], n.pos[2]] as [number, number, number] })),
        []
    );
    const rightNodes = useMemo(
        () => baseNodes.map(n => ({ ...n, pos: [n.pos[0] + 2.2, n.pos[1], n.pos[2]] as [number, number, number] })),
        []
    );

    const particles = useMemo(() => {
        const positions = new Float32Array(60 * 3);
        const speeds = new Float32Array(60);
        for (let i = 0; i < 60; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.4;
            positions[i * 3 + 1] = Math.random() * 4 - 1; // spread along Y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
            speeds[i] = 0.005 + Math.random() * 0.01;
        }
        return { positions, speeds };
    }, []);

    return (
        <div className="w-full h-full relative flex flex-col bg-[#0B0E14]/90 border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="h-9 border-b border-white/5 flex items-center justify-between px-4 bg-white/[0.02] z-10 relative backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                    <GitBranch size={12} className="text-cyan-400" />
                    <span>FIBER ARCHITECTURE</span>
                </div>
                <div className="flex gap-2">
                    <Badge label="Current" color="cyan" />
                    <Badge label="WIP" color="amber" />
                </div>
            </div>

            {/* R3F Scene */}
            <div className="flex-1 relative">
                {/* HUD overlays like reference */}
                <div className="absolute inset-0 pointer-events-none z-20">
                    {/* Subtle vignette + frame */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.55)_65%,rgba(0,0,0,0.85)_100%)]" />
                    <div className="absolute inset-0 ring-1 ring-white/5" />
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    {/* Center divider (behind the beam) */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-amber-300/40 to-transparent opacity-70" />

                    <div className="absolute top-3 left-3 text-[10px] tracking-widest uppercase text-cyan-200/70 font-mono">
                        Current Tree
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120px] text-[10px] tracking-widest uppercase text-slate-300/70 font-mono text-center">
                        <div className="text-[9px] text-slate-400/70">The</div>
                        <div>The Work Loop</div>
                    </div>
                    <div className="absolute top-3 right-3 text-[10px] tracking-widest uppercase text-amber-200/70 font-mono text-right">
                        WIP Tree
                    </div>
                </div>
                <Canvas
                    camera={{ position: [0, 3.0, 10], fov: 32, near: 0.1, far: 100 }}
                    gl={{ antialias: true, alpha: true }}
                >
                    <color attach="background" args={['#05070c']} />
                    <fog attach="fog" args={['#05070c', 6, 12]} />

                    <ambientLight intensity={0.6} />
                    <pointLight position={[0, 4.5, 5]} intensity={1.4} color="#61DAFB" />
                    <pointLight position={[0, 4.5, -5]} intensity={1.2} color="#F59E0B" />

                    {/* Floor Grid (more stable base) */}
                    <group rotation={[-0.45, 0, 0]} position={[0, -1.5, -0.2]}>
                        <Grid
                            args={[18, 18]}
                            cellSize={0.6}
                            cellThickness={0.18}
                            sectionSize={3}
                            sectionThickness={0.45}
                            cellColor="#0f172a"
                            sectionColor="#0b192d"
                            fadeDistance={13}
                            fadeStrength={1}
                            position={[0, 0, 0]}
                            infiniteGrid
                        />
                    </group>

                    {/* Central Energy Column */}
                    <Beam />
                    <ParticleSwarm positions={particles.positions} speeds={particles.speeds} />

                    {/* Left / Current (slight inward focus) */}
                    <group rotation={[0.04, 0.12, 0.02]} position={[-0.45, 0.15, 0]} scale={1.0}>
                        <Tree nodes={leftNodes} edges={edges} color="#61DAFB" dashed={false} />
                    </group>

                    {/* Right / WIP (slight inward focus) */}
                    <group rotation={[0.04, -0.12, -0.02]} position={[0.45, 0.15, 0]} scale={1.0}>
                        <Tree nodes={rightNodes} edges={edges} color="#F59E0B" dashed />
                    </group>

                    {/* Post */}
                    <EffectComposer multisampling={0}>
                        <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.12} luminanceSmoothing={0.9} />
                        <Vignette eskil={false} offset={0.25} darkness={0.8} />
                        <Noise opacity={0.06} />
                    </EffectComposer>
                </Canvas>
            </div>
        </div>
    );
};

// ---------------------- Scene Helpers ----------------------

const Beam: React.FC = () => {
    return (
        <group>
            {/* Core beam */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 9, 32, 1, true]} />
                <meshBasicMaterial color="#fff7ed" transparent opacity={0.75} />
            </mesh>
            {/* Amber edge glow */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 9, 32, 1, true]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.18} />
            </mesh>
            {/* Base bloom */}
            <mesh position={[0, -2.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.12, 0.55, 64]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.18} />
            </mesh>
        </group>
    );
};

const ParticleSwarm: React.FC<{ positions: Float32Array; speeds: Float32Array }> = ({ positions, speeds }) => {
    const ref = useRef<THREE.Points>(null);
    useFrame(() => {
        if (!ref.current) return;
        const pos = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i);
            y += speeds[i];
            if (y > 3.5) y = -2.5;
            pos.setY(i, y);
            // tiny brownian drift around the column
            const x = pos.getX(i) + (Math.random() - 0.5) * 0.002;
            const z = pos.getZ(i) + (Math.random() - 0.5) * 0.002;
            pos.setX(i, THREE.MathUtils.clamp(x, -0.18, 0.18));
            pos.setZ(i, THREE.MathUtils.clamp(z, -0.18, 0.18));
        }
        pos.needsUpdate = true;
    });
    return (
        <Points ref={ref} positions={positions} stride={3}>
            <PointMaterial transparent color="#fbbf24" size={0.04} sizeAttenuation depthWrite={false} />
        </Points>
    );
};

const Tree: React.FC<{ nodes: TreeNode[]; edges: TreeEdge[]; color: string; dashed?: boolean }> = ({ nodes, edges, color, dashed }) => {
    const nodeMap = useMemo(() => {
        const m = new Map<string, TreeNode>();
        nodes.forEach(n => m.set(n.id, n));
        return m;
    }, [nodes]);

    return (
        <group>
            {/* Vertical drop-lines to the floor (depth cue) */}
            {nodes.map(n => (
                <Line
                    key={`drop-${n.id}-${color}`}
                    points={[n.pos, [n.pos[0], -1.65, n.pos[2]]]}
                    color={color}
                    linewidth={0.35}
                    dashed
                    dashSize={0.06}
                    gapSize={0.08}
                    opacity={0.18}
                    transparent
                />
            ))}

            {/* Floor anchor dots */}
            {nodes.map(n => (
                <mesh key={`dot-${n.id}-${color}`} position={[n.pos[0], -1.65, n.pos[2]]}>
                    <circleGeometry args={[0.03, 16]} />
                    <meshBasicMaterial color={color} transparent opacity={0.18} />
                </mesh>
            ))}

            {/* Edges */}
            {edges.map(edge => {
                const a = nodeMap.get(edge.from);
                const b = nodeMap.get(edge.to);
                if (!a || !b) return null;
                const mid: [number, number, number] = [
                    (a.pos[0] + b.pos[0]) / 2,
                    Math.max(a.pos[1], b.pos[1]) + 0.12,
                    (a.pos[2] + b.pos[2]) / 2,
                ];
                const kind = edge.kind;
                const baseColor = kind === 'return' ? '#65a30d' : kind === 'sibling' ? '#8b5cf6' : color;
                const dash = kind === 'return' ? [0.04, 0.04] : dashed ? [0.08, 0.08] : undefined;
                const width = kind === 'sibling' ? 0.32 : 0.5;

                return (
                    <Line
                        key={`${edge.from}-${edge.to}-${kind}`}
                        points={[a.pos, mid, b.pos]}
                        color={baseColor}
                        linewidth={width}
                        dashed={!!dash}
                        dashSize={dash ? dash[0] : 0}
                        gapSize={dash ? dash[1] : 0}
                        opacity={0.65}
                        transparent
                    />
                );
            })}

            {/* Nodes */}
            {nodes.map(node => (
                <NodeCrystal key={node.id} position={node.pos} label={node.label} color={color} />
            ))}
        </group>
    );
};

const NodeCrystal: React.FC<{ position: [number, number, number]; label: string; color: string }> = ({ position, label, color }) => {
    return (
        <group position={position}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[0.3, 0.16, 0.3]} />
                <meshBasicMaterial color={color} transparent opacity={0.02} />
                <Edges scale={1.05} color={color} threshold={20} />
            </mesh>

            {/* Label */}
            <HtmlLabel text={label} color={color} />
        </group>
    );
};

const HtmlLabel: React.FC<{ text: string; color: string }> = ({ text, color }) => (
    text ? (
    <Html
        position={[0, 0.25, 0]}
        center
        transform
        occlude
        style={{
            fontSize: '9px',
            letterSpacing: '2px',
            fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase',
            color,
            textShadow: `0 0 6px ${color}`,
            pointerEvents: 'none',
        }}
    >
        {text}
    </Html>
) : null
);

const Badge = ({ label, color }: { label: string; color: 'cyan' | 'amber' }) => {
    const colors = {
        cyan: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5',
        amber: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${colors[color]}`}>
            {label}
        </span>
    );
};
