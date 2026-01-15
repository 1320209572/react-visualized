import React, { useMemo, useRef } from 'react';
import { GitBranch } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { QuadraticBezierLine, Text, OrbitControls, Line, Grid, Points, PointMaterial, Edges, Cone } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { DesignTokens } from '../../design/tokens';

/**
 * 真实的 Fiber 节点结构
 * 参考：https://react.iamkasong.com/process/fiber.html
 */
type FiberNode = {
    id: string;
    type: string;        // 组件类型
    return: FiberNode | null;   // 父节点
    child: FiberNode | null;    // 第一个子节点
    sibling: FiberNode | null;  // 右边的兄弟节点
    stateNode?: any;     // 真实 DOM 节点
};

/**
 * 构建示例 Fiber 树（模拟 React 的真实结构）
 */
const buildFiberTree = (): FiberNode => {
    // Root Fiber
    const root: FiberNode = {
        id: 'root',
        type: 'HostRoot',
        return: null,
        child: null,
        sibling: null,
    };

    // App Fiber
    const app: FiberNode = {
        id: 'app',
        type: 'App',
        return: root,
        child: null,
        sibling: null,
    };
    root.child = app;

    // div Fiber
    const div: FiberNode = {
        id: 'div',
        type: 'div',
        return: app,
        child: null,
        sibling: null,
    };
    app.child = div;

    // Nav Fiber
    const nav: FiberNode = {
        id: 'nav',
        type: 'Nav',
        return: div,
        child: null,
        sibling: null,
    };
    div.child = nav;

    // Main Fiber (Nav 的兄弟)
    const main: FiberNode = {
        id: 'main',
        type: 'Main',
        return: div,
        child: null,
        sibling: null,
    };
    nav.sibling = main;

    // Button (Nav 的子节点)
    const btn: FiberNode = {
        id: 'btn',
        type: 'button',
        return: nav,
        child: null,
        sibling: null,
    };
    nav.child = btn;

    // Image (Nav 的第二个子节点，Button 的兄弟)
    const img: FiberNode = {
        id: 'img',
        type: 'img',
        return: nav,
        child: null,
        sibling: null,
    };
    btn.sibling = img;

    // Text (Main 的子节点)
    const text: FiberNode = {
        id: 'text',
        type: 'span',
        return: main,
        child: null,
        sibling: null,
    };
    main.child = text;

    // List (Main 的第二个子节点)
    const list: FiberNode = {
        id: 'list',
        type: 'ul',
        return: main,
        child: null,
        sibling: null,
    };
    text.sibling = list;

    // List items
    const li1: FiberNode = {
        id: 'li1',
        type: 'li',
        return: list,
        child: null,
        sibling: null,
    };
    list.child = li1;

    const li2: FiberNode = {
        id: 'li2',
        type: 'li',
        return: list,
        child: null,
        sibling: null,
    };
    li1.sibling = li2;

    return root;
};

/**
 * 将 Fiber 树转换为 3D 可视化节点
 */
type VisualNode = {
    fiber: FiberNode;
    position: [number, number, number];
    connections: Array<{
        to: string;
        type: 'child' | 'sibling' | 'return';
    }>;
};

const layoutFiberTree = (root: FiberNode) => {
    const nodes: VisualNode[] = [];
    const visited = new Set<string>();

    // 深度优先遍历，构建"Fiber 树：Root 在上，向下延伸"的布局
    const traverse = (
        fiber: FiberNode | null,
        depth: number,      // Y 轴：Root 在上（0），子节点向下（递减）
        offsetX: number,    // X 轴：水平展开
        offsetZ: number     // Z 轴：轻微的深度变化
    ) => {
        if (!fiber || visited.has(fiber.id)) return;
        visited.add(fiber.id);

        // 计算 3D 位置 - Fiber 树：Root 在顶部，向下生长（增大间距）
        const x = offsetX;                    // X: 水平展开
        const y = -depth * 2.2;               // Y: Root在上（0），子节点向下（负值），增大垂直间距
        const z = offsetZ + (Math.random() - 0.5) * 0.8;  // Z: 增大深度变化

        const visualNode: VisualNode = {
            fiber,
            position: [x, y, z],
            connections: [],
        };

        // 记录连接关系
        if (fiber.child) {
            visualNode.connections.push({
                to: fiber.child.id,
                type: 'child',
            });
        }
        if (fiber.sibling) {
            visualNode.connections.push({
                to: fiber.sibling.id,
                type: 'sibling',
            });
        }
        if (fiber.return) {
            visualNode.connections.push({
                to: fiber.return.id,
                type: 'return',
            });
        }

        nodes.push(visualNode);

        // 遍历子节点（向下延伸，增大间距）
        if (fiber.child) {
            traverse(
                fiber.child,
                depth + 1,               // 向下延伸（Y 轴负值增大）
                offsetX - 2.5,           // 向左偏移，增大水平间距
                offsetZ + 0.4            // 增大深度偏移
            );
        }

        // 遍历兄弟节点（同一高度，向右展开，增大间距）
        if (fiber.sibling) {
            traverse(
                fiber.sibling,
                depth,                   // 同一高度（Y 轴不变）
                offsetX + 4.0,           // 向右展开，增大水平间距
                offsetZ - 0.4            // 增大深度偏移
            );
        }
    };

    traverse(root, 0, 0, 0);
    return nodes;
};

export const FiberArchitecturePanel: React.FC = () => {
    // 构建真实的 Fiber 树
    const fiberTree = useMemo(() => buildFiberTree(), []);

    // Current Tree (左侧)
    const currentTreeNodes = useMemo(() => layoutFiberTree(fiberTree), [fiberTree]);

    // WIP Tree (右侧) - 增大偏移量，拉开两棵树的距离
    const wipTreeNodes = useMemo(() => {
        const wipRoot = buildFiberTree(); // 克隆一棵树
        const nodes = layoutFiberTree(wipRoot);
        return nodes.map(n => ({
            ...n,
            position: [n.position[0] + 10, n.position[1], n.position[2]] as [number, number, number],
        }));
    }, []);

    return (
        <div className="w-full h-full relative flex flex-col bg-[#0B0E14]/90 border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="h-9 border-b border-white/5 flex items-center justify-between px-4 bg-white/[0.02] z-10 relative backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                    <GitBranch size={12} className="text-cyan-400" />
                    <span>FIBER ARCHITECTURE - Real Structure</span>
                </div>
                <div className="flex gap-2">
                    <Badge label="Current" color="cyan" />
                    <Badge label="WIP" color="amber" />
                </div>
            </div>

            {/* 3D Scene */}
            <div className="flex-1 relative">
                {/* Labels */}
                <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute top-3 left-[20%] text-[10px] tracking-widest uppercase text-cyan-200/70 font-mono">
                        Current Tree
                    </div>
                    <div className="absolute top-3 right-[20%] text-[10px] tracking-widest uppercase text-amber-200/70 font-mono">
                        WIP Tree
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] tracking-widest uppercase text-slate-300/70 font-mono text-center">
                        <div className="text-[9px] text-slate-400/70">The Work Loop</div>
                        <div className="text-amber-300/80">双缓冲机制</div>
                    </div>

                    {/* 连线图例 - 链表语义 */}
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2.5 text-[10px] font-mono shadow-xl">
                        <div className="text-[9px] text-slate-400 mb-2 uppercase tracking-wider font-bold">Fiber Linked List</div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-green-500 rotate-180"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-green-300 text-[9px] font-bold">Child</span>
                                    <span className="text-green-400/60 text-[8px]">主干 · 向下</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-0.5 bg-purple-500 rounded-full shadow-[0_0_6px_rgba(168,85,247,0.6)]"></div>
                                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-purple-500"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-purple-300 text-[9px] font-bold">Sibling</span>
                                    <span className="text-purple-400/60 text-[8px]">同级 · 向右</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-px border-t border-dashed border-blue-400 shadow-[0_0_4px_rgba(59,130,246,0.4)]"></div>
                                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-blue-400"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-blue-300 text-[9px] font-bold">Return</span>
                                    <span className="text-blue-400/60 text-[8px]">回溯 · 向上</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Canvas
                    camera={{
                        position: [0, 0, 26],     // 拉远相机，容纳更大的树结构
                        fov: 60,                  // 稍微增大视角
                        near: 0.1,
                        far: 150,
                    }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: "high-performance"  // 高性能模式
                    }}
                    dpr={[1, 2]}  // 设备像素比，提高清晰度
                >
                    <color attach="background" args={['#020508']} />  {/* 更深的黑色背景 */}
                    <fog attach="fog" args={['#020508', 16, 38]} />  {/* 雾效增强深度感 */}

                    {/* Lights - 多角度照明增强立体感 */}
                    <ambientLight intensity={0.3} />
                    {/* 顶部主光（照亮 Root） */}
                    <pointLight position={[0, 3, 15]} intensity={2.5} color="#ffffff" />
                    {/* 左侧光（Cyan） */}
                    <pointLight position={[-10, 0, 8]} intensity={2} color={DesignTokens.colors.accent.cyan} />
                    {/* 右侧光（Orange） */}
                    <pointLight position={[10, 0, 8]} intensity={2} color={DesignTokens.colors.accent3.orange} />
                    {/* 背光（增强深度） */}
                    <pointLight position={[0, -2, -5]} intensity={1.5} color={DesignTokens.colors.accent2.purple} />
                    {/* 底部填充光 */}
                    <pointLight position={[0, -8, 5]} intensity={1} color="#4a5568" />

                    {/* 地面网格 - 数据空间的基底，调整位置适应更大的树结构 */}
                    <Grid
                        args={[50, 50]}
                        position={[2, -12, 0]}
                        cellSize={1.2}
                        cellThickness={0.6}
                        cellColor="#0a0f1a"
                        sectionSize={5}
                        sectionThickness={1.2}
                        sectionColor="#1a2332"
                        fadeDistance={50}
                        fadeStrength={1.2}
                        infiniteGrid
                    />

                    {/* Current Tree (Cyan) */}
                    <FiberTreeVisualization
                        nodes={currentTreeNodes}
                        color={DesignTokens.colors.accent.cyan}
                        offsetX={-3}
                    />

                    {/* WIP Tree (Orange) */}
                    <FiberTreeVisualization
                        nodes={wipTreeNodes}
                        color={DesignTokens.colors.accent3.orange}
                        offsetX={3}
                    />

                    {/* Center divider - 贯穿整个 Fiber 树（增大高度适应更大的树） */}
                    <mesh position={[2, -5, 0]}>
                        <cylinderGeometry args={[0.02, 0.02, 18, 32]} />
                        <meshBasicMaterial
                            color={DesignTokens.colors.accent3.orange}
                            transparent
                            opacity={0.3}
                        />
                    </mesh>

                    <EffectComposer>
                        {/* 增强发光效果 - 青色光晕 */}
                        <Bloom
                            intensity={2.0}              // 更强的发光
                            luminanceThreshold={0.1}     // 更低的阈值（更多元素发光）
                            luminanceSmoothing={0.9}
                            mipmapBlur               // Mipmap 模糊，更柔和
                        />
                    </EffectComposer>

                    <OrbitControls
                        enablePan={true}
                        minDistance={18}
                        maxDistance={50}
                        target={[2, -4, 0]}
                    />
                </Canvas>
            </div>
        </div>
    );
};

// ==================== 3D Components ====================

const FiberTreeVisualization: React.FC<{
    nodes: VisualNode[];
    color: string;
    offsetX: number;
}> = ({ nodes, color, offsetX }) => {
    const nodeMap = useMemo(() => {
        const map = new Map<string, VisualNode>();
        nodes.forEach(n => map.set(n.fiber.id, n));
        return map;
    }, [nodes]);

    // 生成环境粒子（数据尘埃）
    const particles = useMemo(() => {
        const count = 100;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // 在树周围随机分布
            positions[i * 3] = (Math.random() - 0.5) * 6 + offsetX;     // X
            positions[i * 3 + 1] = Math.random() * 8 - 4;               // Y
            positions[i * 3 + 2] = (Math.random() - 0.5) * 4;           // Z
        }

        return positions;
    }, [offsetX]);

    return (
        <group position={[offsetX, 0, 0]}>
            {/* 环境粒子 - 数据尘埃 */}
            <DataDustParticles positions={particles} color={color} />

            {/* Fiber 连接线和节点 */}
            {/* Fiber 连接线 - child/sibling/return */}
            {nodes.map(node => {
                return node.connections.map((conn, idx) => {
                    const targetNode = nodeMap.get(conn.to);
                    if (!targetNode) return null;

                    // 链表结构的语义化连线：区分主干、兄弟、回溯（极细的线条）
                    let lineColor = color;
                    let glowColor = color;
                    let opacity = 0.75;
                    let lineWidth = 1.0;
                    let dashed = false;
                    let dashSize = 0;
                    let gapSize = 0;
                    let arrowSize = 0.08;

                    if (conn.type === 'child') {
                        // 父→子：主干实线（向下生长）
                        lineColor = '#10b981';
                        glowColor = '#34d399';
                        lineWidth = 1.2;
                        opacity = 0.75;
                        dashed = false;
                        arrowSize = 0.1;
                    } else if (conn.type === 'sibling') {
                        // 兄弟：细平滑曲线（同级，向右延伸）
                        lineColor = '#a855f7';
                        glowColor = '#c084fc';
                        lineWidth = 1.0;
                        opacity = 0.65;
                        dashed = false;
                        arrowSize = 0.08;
                    } else if (conn.type === 'return') {
                        // 子→父：极细虚线（回溯，向上返回）
                        lineColor = '#3b82f6';
                        glowColor = '#60a5fa';
                        lineWidth = 0.6;
                        opacity = 0.3;
                        dashed = true;
                        dashSize = 0.08;
                        gapSize = 0.15;
                        arrowSize = 0.06;
                    }

                    // 计算曲线中点，不同类型不同弧度
                    let midYOffset = 0.3;
                    if (conn.type === 'child') {
                        midYOffset = 0.3;
                    } else if (conn.type === 'sibling') {
                        midYOffset = 0.2;
                    } else if (conn.type === 'return') {
                        midYOffset = 0.6;
                    }

                    const mid: [number, number, number] = [
                        (node.position[0] + targetNode.position[0]) / 2,
                        (node.position[1] + targetNode.position[1]) / 2 + midYOffset,
                        (node.position[2] + targetNode.position[2]) / 2,
                    ];

                    // 计算箭头位置（在目标点附近）
                    const arrowT = 0.75;
                    const arrowPos: [number, number, number] = [
                        (1 - arrowT) * (1 - arrowT) * node.position[0] + 2 * (1 - arrowT) * arrowT * mid[0] + arrowT * arrowT * targetNode.position[0],
                        (1 - arrowT) * (1 - arrowT) * node.position[1] + 2 * (1 - arrowT) * arrowT * mid[1] + arrowT * arrowT * targetNode.position[1],
                        (1 - arrowT) * (1 - arrowT) * node.position[2] + 2 * (1 - arrowT) * arrowT * mid[2] + arrowT * arrowT * targetNode.position[2],
                    ];

                    // 计算箭头方向（从 arrowT-0.05 到 arrowT 的切线方向）
                    const prevT = arrowT - 0.05;
                    const prevPos = [
                        (1 - prevT) * (1 - prevT) * node.position[0] + 2 * (1 - prevT) * prevT * mid[0] + prevT * prevT * targetNode.position[0],
                        (1 - prevT) * (1 - prevT) * node.position[1] + 2 * (1 - prevT) * prevT * mid[1] + prevT * prevT * targetNode.position[1],
                        (1 - prevT) * (1 - prevT) * node.position[2] + 2 * (1 - prevT) * prevT * mid[2] + prevT * prevT * targetNode.position[2],
                    ];

                    const direction = new THREE.Vector3(
                        arrowPos[0] - prevPos[0],
                        arrowPos[1] - prevPos[1],
                        arrowPos[2] - prevPos[2]
                    ).normalize();

                    // 计算箭头旋转（指向目标）
                    const up = new THREE.Vector3(0, 1, 0);
                    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
                    const euler = new THREE.Euler().setFromQuaternion(quaternion);

                    return (
                        <group key={`${node.fiber.id}-${conn.to}-${conn.type}`}>
                            {/* 主线 */}
                            <QuadraticBezierLine
                                start={node.position}
                                end={targetNode.position}
                                mid={mid}
                                color={lineColor}
                                lineWidth={lineWidth}
                                transparent
                                opacity={opacity}
                                dashed={dashed}
                                dashSize={dashed ? dashSize : undefined}
                                gapSize={dashed ? gapSize : undefined}
                            />
                            {/* 柔和光晕 */}
                            <QuadraticBezierLine
                                start={node.position}
                                end={targetNode.position}
                                mid={mid}
                                color={glowColor}
                                lineWidth={lineWidth * 2.2}
                                transparent
                                opacity={opacity * 0.15}
                            />
                            {/* 方向箭头 */}
                            <Cone
                                position={arrowPos}
                                rotation={euler}
                                args={[arrowSize, arrowSize * 2, 8]}
                            >
                                <meshBasicMaterial
                                    color={lineColor}
                                    transparent
                                    opacity={opacity}
                                />
                            </Cone>
                        </group>
                    );
                });
            })}

            {/* Draw nodes */}
            {nodes.map(node => (
                <FiberNodeCrystal
                    key={node.fiber.id}
                    position={node.position}
                    label={node.fiber.type}
                    color={color}
                />
            ))}
        </group>
    );
};

const FiberNodeCrystal: React.FC<{
    position: [number, number, number];
    label: string;
    color: string;
}> = ({ position, label, color }) => {
    const boxRef = useRef<THREE.Mesh>(null);
    const coreRef = useRef<THREE.Mesh>(null);

    // 根据深度计算缩放比例
    const depthScale = 1 + position[1] * 0.02;
    const baseScale = Math.max(0.7, depthScale);

    // 移除呼吸灯效果，节点保持完全静态

    return (
        <group position={position} scale={baseScale}>
            {/* 外层透明壳子 - 扁平长方体（上下正方形，四周长方形） */}
            <mesh ref={boxRef}>
                <boxGeometry args={[1.4, 0.7, 1.4]} />
                <meshPhysicalMaterial
                    color={color}
                    transmission={0.85}
                    thickness={0.5}
                    roughness={0.4}
                    metalness={0.05}
                    clearcoat={0.5}
                    clearcoatRoughness={0.2}
                    ior={1.5}
                    transparent
                    opacity={0.3}
                    envMapIntensity={0.5}
                />
                {/* 锐利的边缘 */}
                <Edges
                    scale={1.0}
                    threshold={15}
                    color={color}
                    linewidth={1.5}
                />
            </mesh>

            {/* 内核 - 悬浮的发光球体 */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.42, 32, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* 内核的强光点 */}
            <mesh>
                <sphereGeometry args={[0.28, 16, 16]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* 青色光晕 - 增强光照强度和距离 */}
            <pointLight
                position={[0, 0, 0]}
                color={color}
                intensity={3.5}
                distance={3.0}
                decay={2}
            />

            {/* 标签 - 调整位置和字体大小 */}
            <Text
                position={[0, -0.85, 0]}
                fontSize={0.28}
                color="#ffffff"
                anchorX="center"
                anchorY="top"
                outlineWidth={0.025}
                outlineColor="#000000"
            >
                {label}
            </Text>
        </group>
    );
};

// 环境粒子 - 数据尘埃
const DataDustParticles: React.FC<{
    positions: Float32Array;
    color: string;
}> = ({ positions, color }) => {
    const pointsRef = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const pos = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < pos.count; i++) {
            // 缓慢上下漂浮
            let y = pos.getY(i);
            y += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.001;
            pos.setY(i, y);

            // 轻微的 Z 轴漂移
            let z = pos.getZ(i);
            z += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.0005;
            pos.setZ(i, z);
        }

        pos.needsUpdate = true;
    });

    return (
        <Points ref={pointsRef} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color={color}
                size={0.03}
                sizeAttenuation
                opacity={0.4}
                depthWrite={false}
                blending={THREE.AdditiveBlending}  // 叠加混合，产生发光效果
            />
        </Points>
    );
};

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
