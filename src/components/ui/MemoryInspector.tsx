import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Database, ArrowRight } from 'lucide-react';

export const MemoryInspector: React.FC = () => {
    const [showConflict, setShowConflict] = useState(false);

    // In a real implementation, we would use refs to calculate exact positions.
    // For this blueprint, we use percentage-based coordinates for the SVG bezier curves.

    return (
        <div className="w-full h-full relative flex overflow-hidden bg-transparent select-none">

            {/* SVG Tether Layer (Z-Index 0) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                    <filter id="glow-line" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="tether-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={showConflict ? '#EF4444' : '#22D3EE'} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={showConflict ? '#EF4444' : '#A855F7'} stopOpacity="0.8" />
                    </linearGradient>
                </defs>

                {/* Connection from Stack Frame to First Hook */}
                <motion.path
                    d="M 280 140 C 350 140, 350 300, 450 300"
                    fill="none"
                    stroke="url(#tether-gradient)"
                    strokeWidth={showConflict ? 3 : 1.5}
                    filter="url(#glow-line)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: 1,
                        opacity: 1,
                        strokeDasharray: showConflict ? "5,5" : "none"
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />

                {/* Animated Flow Particles on the line */}
                {showConflict && (
                     <motion.circle r="3" fill="#EF4444">
                        <animateMotion
                            dur="1s"
                            repeatCount="indefinite"
                            path="M 280 140 C 350 140, 350 300, 450 300"
                        />
                    </motion.circle>
                )}
            </svg>

            {/* 1. Stack Section (Left) */}
            <div className="w-[320px] h-full p-6 border-r border-white/5 bg-gray-900/30 backdrop-blur-sm flex flex-col gap-4 z-10 relative">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                        <Database size={12} /> Call Stack
                    </h3>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                    <StackFrame
                        name="Counter"
                        line="24:12"
                        vars={{ count: showConflict ? "0 (Stale)" : "0" }}
                        active={true}
                        hasConflict={showConflict}
                    />
                    <StackFrame
                        name="App"
                        line="12:05"
                        vars={{ route: "/lab" }}
                        active={false}
                    />
                </div>

                <button
                    onClick={() => setShowConflict(!showConflict)}
                    className={`mt-auto w-full py-3 px-4 rounded border text-[10px] font-bold tracking-wider transition-all flex items-center justify-center gap-2 font-mono uppercase
                        ${showConflict
                            ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                        }
                    `}
                >
                    <AlertTriangle size={12} />
                    {showConflict ? 'RESET SIMULATION' : 'TRIGGER STALE CLOSURE'}
                </button>
            </div>

            {/* 2. Memory Chain (Right) */}
            <div className="flex-1 relative p-8 flex items-center overflow-x-auto z-10">
                <div className="absolute top-6 left-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    FIBER.MEMOIZEDSTATE (LINKED LIST)
                </div>

                <div className="flex items-center gap-8 pl-16">
                    <CrystalNode index={0} value={1} type="useState" active={true} showConflict={showConflict} />
                    <LinkArrow />
                    <CrystalNode index={1} value="fn()" type="useEffect" active={false} />
                    <LinkArrow />
                    <CrystalNode index={2} value="null" type="useRef" active={false} />
                    <LinkArrow />
                    <CrystalNode index={3} value="fmt" type="useMemo" active={false} />

                    {/* Ghost Node */}
                    <div className="w-8 h-8 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white/10 rounded-full" />
                    </div>
                </div>
            </div>

            {/* 4. Conflict Warning Popup */}
            <AnimatePresence>
                {showConflict && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute top-6 right-6 w-80 bg-black/80 backdrop-blur-xl border border-red-500/50 rounded-lg shadow-[0_0_50px_rgba(239,68,68,0.2)] overflow-hidden z-50"
                    >
                        <div className="bg-red-500/10 px-4 py-3 border-b border-red-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-400 font-bold text-[10px] uppercase tracking-wider font-mono">
                                <AlertTriangle size={12} />
                                Stale Closure Warning
                            </div>
                            <button onClick={() => setShowConflict(false)} className="text-red-400/50 hover:text-red-400">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-xs text-slate-300 leading-relaxed font-mono">
                                The function <code>handleClick</code> is closing over an outdated value from the first render.
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-red-950/30 border border-red-900/50 p-2 rounded">
                                    <div className="text-[9px] text-red-400/70 uppercase mb-1 font-mono">Captured</div>
                                    <div className="text-xl font-mono text-red-400 font-bold">0</div>
                                </div>
                                <div className="bg-emerald-950/30 border border-emerald-900/50 p-2 rounded">
                                    <div className="text-[9px] text-emerald-400/70 uppercase mb-1 font-mono">Latest Heap</div>
                                    <div className="text-xl font-mono text-emerald-400 font-bold">1</div>
                                </div>
                            </div>
                        </div>
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:4px_4px] pointer-events-none opacity-50" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub Components ---

const StackFrame = ({ name, line, vars, active, hasConflict }: any) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
            relative p-4 rounded-lg border backdrop-blur-md transition-all group cursor-pointer
            ${active
                ? hasConflict
                    ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                    : 'bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                : 'bg-gray-800/40 border-white/5 hover:border-white/10'
            }
        `}
    >
        {/* Active Indicator Bar */}
        {active && (
            <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full ${hasConflict ? 'bg-red-500' : 'bg-cyan-400'}`} />
        )}

        <div className="flex justify-between items-start mb-2 pl-2">
            <div>
                <div className={`text-sm font-bold font-mono ${active ? (hasConflict ? 'text-red-200' : 'text-cyan-200') : 'text-slate-400'}`}>
                    {name}
                </div>
                <div className="text-[10px] font-mono text-slate-600">Line {line}</div>
            </div>
            {active && <div className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${hasConflict ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'}`}>EXEC</div>}
        </div>

        {/* Variables Scope */}
        <div className="pl-2 space-y-1">
            {Object.entries(vars).map(([key, val]: any) => (
                <div key={key} className="flex justify-between text-[10px] font-mono border-t border-white/5 pt-1 mt-1">
                    <span className="text-purple-400">{key}:</span>
                    <span className={hasConflict ? 'text-red-400 font-bold' : 'text-slate-300'}>{val}</span>
                </div>
            ))}
        </div>
    </motion.div>
);

const CrystalNode = ({ index, value, type, active, showConflict }: any) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        className="relative group"
    >
        {/* Hexagon Shape CSS */}
        <div className={`
            w-24 h-28 relative flex items-center justify-center
            before:content-[''] before:absolute before:inset-0 before:bg-[#171C24] before:opacity-80
            before:[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]
            after:content-[''] after:absolute after:inset-0.5 after:border after:border-white/10
            after:[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]
            transition-all duration-500
            ${active
                ? showConflict
                    ? 'drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] after:border-red-500/50'
                    : 'drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] after:border-cyan-500/50'
                : 'hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]'
            }
        `}>
            <div className="z-10 text-center">
                <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 font-mono ${active ? (showConflict ? 'text-red-400' : 'text-cyan-400') : 'text-slate-500'}`}>
                    {type}
                </div>
                <div className="text-lg font-bold font-mono text-white mb-1">{value}</div>
                <div className="text-[9px] text-slate-600 font-mono">next: 0x{index + 1}8A</div>
            </div>

            {/* Index Badge */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black/50 border border-white/10 px-1.5 rounded text-[9px] font-mono text-slate-400">
                idx:{index}
            </div>
        </div>
    </motion.div>
);

const LinkArrow = () => (
    <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 24, opacity: 1 }}
        className="h-[1px] bg-white/10 flex items-center justify-center shrink-0"
    >
        <ArrowRight size={12} className="text-slate-700" />
    </motion.div>
);
