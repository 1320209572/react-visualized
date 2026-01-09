import React from 'react';
import { Box, Edges, Plane, Text } from '@react-three/drei';
import { QuadraticBezierLine } from '@react-three/drei';

const labelColor = '#22d3ee';
const labelEdge = '#38bdf8';
const panelGlass = '#0b0b10';

export const StaticBlueprint: React.FC = () => {
  return (
    <group>
      {/* Left code wall */}
      <group position={[-3.5, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Plane args={[3.8, 4.0]}>
          <meshPhysicalMaterial color={panelGlass} transparent opacity={0.32} roughness={0.18} metalness={0.05} />
        </Plane>
        <Box args={[0.08, 4.1, 4.1]}>
          <meshPhysicalMaterial color={labelColor} transparent opacity={0.08} />
          <Edges color={labelColor} />
        </Box>
        <Text position={[0, 2.1, 0]} fontSize={0.24} color={labelColor} anchorX="center" anchorY="middle">
          Source Logic
        </Text>
        {/* Code lines */}
        <group position={[-1.7, 1.6, 0]}>
          {codeLines.map((line, i) => {
            const isActive = i === 4; // highlight setCount
            return (
              <group key={i} position={[0, -i * 0.33, 0]}>
                {isActive && (
                  <Box args={[3.3, 0.32, 0.05]} position={[1.65, -0.08, -0.05]}>
                    <meshPhysicalMaterial
                      color="#06b6d4"
                      emissive="#0ea5e9"
                      emissiveIntensity={0.75}
                      transmission={0.75}
                      thickness={0.2}
                      transparent
                      opacity={0.6}
                    />
                    <Edges color={labelColor} />
                  </Box>
                )}
                <Text fontSize={0.16} color={isActive ? '#ffffff' : '#94a3b8'} anchorX="left" anchorY="top">
                  {line}
                </Text>
              </group>
            );
          })}
        </group>
        {/* Red hint */}
        <Text position={[0, 1.9, 0.02]} fontSize={0.16} color="#ef4444" anchorX="center">
          闭包锁住 count，后续队列仍携带为 0
        </Text>
      </group>

      {/* HandleClick floating card */}
      <group position={[-1.0, 0.4, 0.0]}>
        <Box args={[0.08, 0.9, 1.8]}>
          <meshPhysicalMaterial color={labelColor} transparent opacity={0.12} />
          <Edges color={labelEdge} />
        </Box>
        <Text position={[0.05, 0.2, 0]} fontSize={0.2} color="#e2e8f0" anchorX="center" anchorY="middle">
          handleClick
        </Text>
        <Text position={[0.05, -0.1, 0]} fontSize={0.14} color="#cbd5e1" anchorX="center" anchorY="middle">
          Count 闭包快照：0
        </Text>
        <Text position={[0.05, -0.32, 0]} fontSize={0.13} color="#cbd5e1" anchorX="center" anchorY="middle">
          count: 0
        </Text>
      </group>

      {/* Top badges */}
      <group position={[0, 2.9, -1.3]}>
        <Badge text="ustate(0)" width={1.4} />
        <group position={[0, -0.45, 0]}>
          <Badge text="count = 0" width={1.6} />
        </group>
        <group position={[0, -0.95, 0]}>
          <Badge text="count ≤ 0" width={1.6} />
        </group>
      </group>

      {/* Right queue wall */}
      <group position={[3.8, 0, 0]}>
        <Plane args={[2.8, 4.7]} position={[0, -0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <meshPhysicalMaterial color={panelGlass} transparent opacity={0.18} roughness={0.18} metalness={0.05} />
        </Plane>
        <Box args={[0.05, 4.8, 2.8]} position={[0.03, -0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <meshPhysicalMaterial color={labelColor} transparent opacity={0.1} />
          <Edges color={labelColor} />
        </Box>
        <Text
          position={[0.1, 2.35, 0]}
          fontSize={0.26}
          color={labelColor}
          rotation={[0, -Math.PI / 2, 0]}
          anchorX="center"
          anchorY="middle"
        >
          Update Queue
        </Text>
        {/* Cards */}
        {queueCards.map((card, i) => {
          const y = -1.6 + i * 0.9;
          return (
            <group key={i} position={[0.12, y, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <Box args={[0.06, 0.75, 2.2]}>
                <meshPhysicalMaterial color={labelColor} transparent opacity={0.28} transmission={0.7} />
                <Edges color={labelEdge} />
              </Box>
              <Text position={[0.05, 0.16, 0]} fontSize={0.14} color="#e2e8f0" anchorX="left" anchorY="middle">
                {card.line1}
              </Text>
              <Text position={[0.05, -0.12, 0]} fontSize={0.12} color="#cbd5e1" anchorX="left" anchorY="middle">
                {card.line2}
              </Text>
            </group>
          );
        })}
        {/* Big result pill */}
        <group position={[0.25, 0.6, 0]}>
          <Box args={[0.08, 0.9, 2.4]}>
            <meshPhysicalMaterial
              color={labelColor}
              emissive={labelEdge}
              emissiveIntensity={0.35}
              transmission={0.75}
              thickness={0.6}
              roughness={0.1}
              transparent
              opacity={0.28}
            />
            <Edges color={labelEdge} />
          </Box>
          <Text position={[0.05, 0.1, 0]} fontSize={0.38} color="#e0f2fe" anchorX="center" anchorY="middle">
            1
          </Text>
          <Text position={[0.05, -0.25, 0]} fontSize={0.16} color="#e2e8f0" anchorX="center" anchorY="middle">
            count 新 0 差 1
          </Text>
        </group>
        {/* Loop arrow */}
        <QuadraticBezierLine
          start={[0.1, -0.9, 0.6]}
          end={[0.1, 1.2, -0.4]}
          mid={[0.7, 0.1, 0.4]}
          color={labelColor}
          lineWidth={2}
          transparent
          opacity={0.5}
        />
        {/* Red arrow */}
        <QuadraticBezierLine
          start={[0, 0.2, 0]}
          end={[-2.8, 0.0, 0]}
          mid={[-1.4, 0.4, 0.1]}
          color="#ef4444"
          lineWidth={2.5}
          transparent
          opacity={0.8}
        />
      </group>

      {/* Floor pad */}
      <group position={[0, -3.4, 0]}>
        <Plane args={[3.4, 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.08} />
        </Plane>
        <Box args={[3.2, 0.05, 3.2]} position={[0, 0.03, 0]}>
          <meshPhysicalMaterial color={labelColor} transparent opacity={0.08} />
          <Edges color={labelEdge} />
        </Box>
      </group>
    </group>
  );
};

const Badge = ({ text, width = 1.4 }: { text: string; width?: number }) => (
  <group>
    <Box args={[0.06, 0.28, width]}>
      <meshPhysicalMaterial
        color={labelColor}
        emissive={labelColor}
        emissiveIntensity={0.25}
        transmission={0.8}
        thickness={0.5}
        roughness={0.1}
        transparent
        opacity={0.2}
      />
      <Edges color={labelEdge} />
    </Box>
    <Text position={[0.05, 0, 0]} fontSize={0.14} color="#e2e8f0" anchorX="center" anchorY="middle">
      {text}
    </Text>
  </group>
);

const codeLines = [
  'function Counter() {',
  '  const [count, setCount] = useState(0);',
  '  const handleClick = () => {',
  '    // 问题：闭包捕获 0',
  '    setCount(count + 1);',
  '    setCount(count + 1);',
  '    setCount(count + 1);',
  '  };',
  '  return <button>{count}</button>;',
  '}',
];

const queueCards = [
  { line1: '寄件 count = 0 + 1', line2: '(闭包快照 0)' },
  { line1: '寄件 count = 0 + 1', line2: '(闭包快照 0)' },
  { line1: '寄件 count = 0 + 1', line2: '(闭包快照 0)' },
  { line1: '寄件 count = 0 + 1', line2: '(闭包快照 0)' },
];
