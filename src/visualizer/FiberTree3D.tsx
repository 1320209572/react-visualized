import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Octahedron, QuadraticBezierLine } from '@react-three/drei';
import { hierarchy, tree } from 'd3-hierarchy';
import { useStore } from '../store';
import type { Fiber } from '../engine/types';
import * as THREE from 'three';

// Crystal Node Component - Diamond/Rhombus Shape
const CrystalNode: React.FC<{
  position: [number, number, number];
  label: string;
  type: 'current' | 'wip';
  isActive?: boolean;
}> = ({ position, label, type, isActive }) => {
  const color = type === 'current' ? '#06b6d4' : '#f97316'; // Cyan vs Orange
  const emissive = type === 'current' ? '#0891b2' : '#ea580c';

  return (
    <group position={position}>
      {/* Diamond Crystal */}
      <Octahedron args={[0.3, 0]}>
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isActive ? 0.8 : 0.4}
          transmission={0.7}
          thickness={0.5}
          roughness={0.1}
          transparent
          opacity={0.85}
        />
      </Octahedron>

      {/* Glow Ring for Active */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.15}
        color="#e2e8f0"
        anchorX="center"
        anchorY="top"
      >
        {label}
      </Text>
    </group>
  );
};

// Connection Line Component
const ConnectionLine: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  type: 'current' | 'wip';
}> = ({ start, end, type }) => {
  const color = type === 'current' ? '#334155' : '#fb923c';
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 - 0.2,
    (start[2] + end[2]) / 2,
  ];

  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={mid}
      color={color}
      lineWidth={type === 'wip' ? 2 : 1}
      transparent
      opacity={type === 'wip' ? 0.6 : 0.3}
    />
  );
};

// Main Component
export const FiberTree3D: React.FC = () => {
  const currentRoot = useStore(s => s.currentRoot);
  const wipRoot = useStore(s => s.wipRoot);
  const workInProgress = useStore(s => s.workInProgress);

  const { currentNodes, currentEdges, wipNodes, wipEdges } = useMemo(() => {
    const result = {
      currentNodes: [] as any[],
      currentEdges: [] as any[],
      wipNodes: [] as any[],
      wipEdges: [] as any[],
    };

    // Helper: Convert Fiber to d3 hierarchy and layout
    const layoutTree = (root: Fiber | null, offsetX: number) => {
      if (!root) return { nodes: [], edges: [] };

      // Build hierarchy structure
      const buildHierarchy = (fiber: Fiber): any => {
        const node = {
          fiber,
          children: [] as any[],
        };

        let child = fiber.child;
        while (child) {
          node.children.push(buildHierarchy(child));
          child = child.sibling!;
        }

        return node;
      };

      const rootNode = buildHierarchy(root);
      const hierarchyRoot = hierarchy(rootNode);

      // Use d3-hierarchy tree layout
      const treeLayout = tree<any>()
        .size([6, 5]) // width, height
        .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

      const layoutRoot = treeLayout(hierarchyRoot);

      const nodes: any[] = [];
      const edges: any[] = [];

      layoutRoot.descendants().forEach((d) => {
        const fiber = d.data.fiber;
        nodes.push({
          id: fiber._debugID,
          position: [d.x - 3 + offsetX, -d.y, 0] as [number, number, number],
          label: typeof fiber.type === 'string' ? fiber.type : fiber.type?.name || 'Root',
          fiber,
        });

        if (d.parent) {
          edges.push({
            from: d.parent.data.fiber._debugID,
            to: fiber._debugID,
          });
        }
      });

      return { nodes, edges };
    };

    // Layout Current Tree (left side)
    if (currentRoot) {
      const { nodes, edges } = layoutTree(currentRoot, -4);
      result.currentNodes = nodes;
      result.currentEdges = edges;
    }

    // Layout WIP Tree (right side)
    if (wipRoot) {
      const { nodes, edges } = layoutTree(wipRoot, 4);
      result.wipNodes = nodes;
      result.wipEdges = edges;
    }

    return result;
  }, [currentRoot, wipRoot]);

  return (
    <div className="w-full h-full bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800/50">
      {/* Header Labels */}
      <div className="absolute top-4 left-6 z-10 text-cyan-400 font-mono text-xs font-bold tracking-widest pointer-events-none">
        CURRENT TREE
      </div>
      <div className="absolute top-4 right-6 z-10 text-orange-400 font-mono text-xs font-bold tracking-widest pointer-events-none">
        WIP TREE
      </div>

      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#06b6d4" />

        {/* Current Tree */}
        <group>
          {currentNodes.map((node) => (
            <CrystalNode
              key={`current-${node.id}`}
              position={node.position}
              label={node.label}
              type="current"
              isActive={node.fiber === workInProgress}
            />
          ))}
          {currentEdges.map((edge, i) => {
            const from = currentNodes.find((n) => n.id === edge.from);
            const to = currentNodes.find((n) => n.id === edge.to);
            if (!from || !to) return null;
            return (
              <ConnectionLine
                key={`current-edge-${i}`}
                start={from.position}
                end={to.position}
                type="current"
              />
            );
          })}
        </group>

        {/* WIP Tree */}
        <group>
          {wipNodes.map((node) => (
            <CrystalNode
              key={`wip-${node.id}`}
              position={node.position}
              label={node.label}
              type="wip"
              isActive={node.fiber === workInProgress}
            />
          ))}
          {wipEdges.map((edge, i) => {
            const from = wipNodes.find((n) => n.id === edge.from);
            const to = wipNodes.find((n) => n.id === edge.to);
            if (!from || !to) return null;
            return (
              <ConnectionLine
                key={`wip-edge-${i}`}
                start={from.position}
                end={to.position}
                type="wip"
              />
            );
          })}
        </group>

        {/* Divider Line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, -5, 0, 0, 5, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#475569" opacity={0.3} transparent />
        </line>

        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
    </div>
  );
};
