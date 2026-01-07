import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// A dynamic link that connects a Stack Variable (DOM ID) to a Heap Node (DOM ID)
// It calculates positions continuously or on specific triggers
interface GravitationalLinkProps {
    sourceId: string;
    targetId: string;
    active: boolean;
    color?: string; // Optional color override
    dashed?: boolean;
}

export const GravitationalLink: React.FC<GravitationalLinkProps> = ({ sourceId, targetId, active, color, dashed = true }) => {
    const [coords, setCoordinates] = useState<{x1:number, y1:number, x2:number, y2:number} | null>(null);

    useEffect(() => {
        if (!active) return;

        let rafId: number;
        const update = () => {
            const src = document.getElementById(sourceId);
            const tgt = document.getElementById(targetId);

            if (src && tgt) {
                const r1 = src.getBoundingClientRect();
                const r2 = tgt.getBoundingClientRect();

                // Convert to relative coordinates if needed, or use fixed overlay
                // Assuming this component is in a fixed overlay container
                setCoordinates({
                    x1: r1.right,
                    y1: r1.top + r1.height / 2,
                    x2: r2.left,
                    y2: r2.top + r2.height / 2
                });
            }
        };

        const loop = () => {
            update();
            rafId = requestAnimationFrame(loop);
        }
        loop();

        return () => cancelAnimationFrame(rafId);
    }, [sourceId, targetId, active]);

    if (!coords || !active) return null;

    // Calculate control points for Bezier
    const dist = Math.abs(coords.x2 - coords.x1);
    const cp1x = coords.x1 + dist * 0.5;
    const cp2x = coords.x2 - dist * 0.5;
    const pathD = `M ${coords.x1} ${coords.y1} C ${cp1x} ${coords.y1}, ${cp2x} ${coords.y2}, ${coords.x2} ${coords.y2}`;

    // Unique gradient ID based on source/target to avoid conflicts
    const gradId = `grad-${sourceId}-${targetId}`;

    return (
        <svg style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9000 }}>
            <defs>
                <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2}>
                    <stop offset="0%" stopColor={color || "#a855f7"} />
                    <stop offset="100%" stopColor={color || "#22d3ee"} />
                </linearGradient>
            </defs>
            <motion.path
                d={pathD}
                fill="none"
                stroke={color ? color : `url(#${gradId})`}
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                strokeDasharray={dashed ? "5,5" : "none"}
            />

            {/* Glowing Pulse moving along the line */}
            <motion.circle r="3" fill={color || "#fff"} cx="0" cy="0">
                <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path={pathD}
                />
            </motion.circle>
        </svg>
    );
};
