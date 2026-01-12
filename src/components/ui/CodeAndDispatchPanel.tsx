import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Zap } from 'lucide-react';

export const CodeAndDispatchPanel: React.FC = () => {
    return (
        <div className="w-full h-full relative flex flex-col bg-[#0B0E14]/80 backdrop-blur-2xl border border-white/5 rounded-xl overflow-hidden group">
            {/* 1. Rim Light Gradient */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#61DAFB] via-[#A855F7] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

            {/* Panel Header */}
            <div className="h-9 border-b border-white/5 flex items-center justify-between px-4 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                    <Code2 size={12} className="text-[#A855F7]" />
                    <span>SOURCE.TSX</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/5 border border-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/5 border border-white/10" />
                </div>
            </div>

            {/* 2. Code Editor Area */}
            <div className="flex-1 p-4 font-mono text-xs leading-6 overflow-hidden relative">
                {/* Background Grid for precision feel */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_23px,rgba(255,255,255,0.02)_24px)] bg-[size:100%_24px] pointer-events-none" />

                <CodeLine num={1} content={<>
                    <span className="text-[#A855F7]">function</span> <span className="text-[#F59E0B]">Counter</span>() {'{'}
                </>} />

                <CodeLine num={2} content={<>
                    <span className="text-slate-500">// Lane: Sync</span>
                </>} />

                {/* Highlighted State Hook */}
                <div className="relative group/line -mx-4 px-4 bg-[#61DAFB]/5 border-l-2 border-[#61DAFB]">
                    <CodeLine num={3} content={<>
                        <span className="text-[#A855F7]">const</span> [count, setCount] = <span className="text-[#61DAFB]">useState</span>(0);
                    </>} />
                    {/* Glowing Effect on Highlight */}
                    <div className="absolute inset-0 bg-[#61DAFB]/5 blur-sm opacity-0 group-hover/line:opacity-100 transition-opacity" />
                </div>

                <CodeLine num={4} content={<></>} />

                <CodeLine num={5} content={<>
                    <span className="text-[#A855F7]">const</span> handleClick = () ={'>'} {'{'}
                </>} />

                {/* Highlighted Update Call */}
                <div className="relative group/line -mx-4 px-4">
                    <CodeLine num={6} content={<>
                        <span className="ml-4"><span className="text-[#61DAFB]">setCount</span>(c ={'>'} c + 1);</span>
                    </>} />
                    {/* Subtle Purple Background */}
                    <div className="absolute inset-0 bg-[#A855F7]/10 pointer-events-none" />
                    {/* Blinking Dot on Line Number */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#A855F7] animate-pulse shadow-[0_0_4px_#A855F7]" />
                </div>

                <CodeLine num={7} content={<>
                    {'}'};
                </>} />

                <CodeLine num={8} content={<>
                    <span className="text-[#A855F7]">return</span> (
                </>} />

                <CodeLine num={9} content={<>
                    <span className="ml-4">&lt;<span className="text-[#F59E0B]">button</span> onClick={'{handleClick}'}&gt;</span>
                </>} />
            </div>

            {/* 3. Dispatch Dashboard */}
            <div className="h-[8.5rem] border-t border-white/5 bg-[#0F1218]/60 backdrop-blur-md px-3 py-3 flex items-center gap-5 relative overflow-hidden">
                {/* Dashboard Label */}
                <div className="absolute top-2 left-2 text-[9px] font-bold text-slate-600 tracking-widest uppercase flex items-center gap-1">
                    <Zap size={10} /> Dispatcher
                </div>

                {/* Circular Progress (Lane Indicator) */}
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0 ml-1 mt-2">
                    {/* Dashed Outer Ring (Cyan, Translucent) */}
                    <div className="absolute inset-[-4px] rounded-full border border-dashed border-[#61DAFB]/30 opacity-60 animate-spin-slow" style={{ animationDuration: '20s' }} />

                    {/* Scale Ticks (0, 90, 180, 270) */}
                    {[0, 90, 180, 270].map((deg) => (
                        <div
                            key={deg}
                            className="absolute w-0.5 h-1 bg-[#61DAFB]/50"
                            style={{
                                top: '50%', left: '50%',
                                transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-34px)`
                            }}
                        />
                    ))}

                    {/* Background Ring */}
                    <svg className="w-full h-full -rotate-90 overflow-visible">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#1F2937" strokeWidth="6" />
                        <circle
                            cx="32" cy="32" r="28"
                            fill="none"
                            stroke="#61DAFB"
                            strokeWidth="6"
                            strokeDasharray="175"
                            strokeDashoffset="40"
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_5px_#61DAFB]"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-[8px] text-slate-500 font-mono tracking-wider mb-0.5">LANE</span>
                        <span
                            className="text-xl font-black text-[#61DAFB] font-mono leading-none"
                            style={{ textShadow: '0 0 8px #61DAFB' }}
                        >
                            1
                        </span>
                    </div>
                </div>

                {/* Data List */}
                <div className="flex-1 grid grid-cols-2 gap-y-1.5 gap-x-2 font-mono text-[10px] mt-2">
                    <DataItem label="PRIORITY" value="SyncLane" color="#EF4444" glow />
                    <DataItem label="SOURCE" value="onClick" color="#A855F7" glow />
                    <DataItem label="PAYLOAD" value="Update<+1>" color="#F59E0B" />
                    <DataItem label="FIBER" value="<Counter/>" color="#61DAFB" />
                </div>

                {/* 4. Animated Waveform (Bottom Overlay) */}
                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none mix-blend-screen overflow-hidden">
                    <Waveform />
                </div>
            </div>
        </div>
    );
};

const CodeLine = ({ num, content }: { num: number, content: React.ReactNode }) => (
    <div className="flex relative z-10">
        <span className="w-8 text-slate-700 text-right mr-4 select-none font-mono text-[10px] pt-1">{num}</span>
        <span className="text-slate-300 font-mono tracking-wide">{content}</span>
    </div>
);

const DataItem = ({ label, value, color, glow }: { label: string, value: string, color: string, glow?: boolean }) => (
    <div className="flex flex-col">
        <span className="text-slate-500 mb-0.5 text-[10px] tracking-[0.2em] scale-90 origin-left opacity-60 font-bold">{label}</span>
        <span
            style={{
                color,
                textShadow: glow ? `0 0 10px ${color}80` : 'none',
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '1px'
            }}
            className="font-bold text-[11px]"
        >
            {value}
        </span>
    </div>
);

const Waveform = () => (
    <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full"
    >
        <svg className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity="0" />
                    <stop offset="50%" stopColor="#A855F7" stopOpacity="1" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="wave-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
                <filter id="wave-glow">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#A855F7" />
                </filter>
            </defs>

            {/* Filled Area */}
            <motion.path
                d="M0 20 Q 50 5, 100 20 T 200 20 T 300 20 T 400 20 T 500 20 V 50 H 0 Z"
                fill="url(#wave-fill)"
                stroke="none"
                animate={{ d: [
                    "M0 20 Q 50 5, 100 20 T 200 20 T 300 20 T 400 20 T 500 20 V 50 H 0 Z",
                    "M0 20 Q 50 35, 100 20 T 200 20 T 300 20 T 400 20 T 500 20 V 50 H 0 Z"
                ], x: [-100, 0] }}
                transition={{
                    d: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                    x: { duration: 5, repeat: Infinity, ease: "linear" }
                }}
            />

            {/* Main Line */}
            <motion.path
                d="M0 20 Q 50 5, 100 20 T 200 20 T 300 20 T 400 20 T 500 20"
                fill="none"
                stroke="url(#wave-grad)"
                strokeWidth="2"
                filter="url(#wave-glow)"
                animate={{ d: [
                    "M0 20 Q 50 5, 100 20 T 200 20 T 300 20 T 400 20 T 500 20",
                    "M0 20 Q 50 35, 100 20 T 200 20 T 300 20 T 400 20 T 500 20"
                ], x: [-100, 0] }}
                transition={{
                    d: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                    x: { duration: 5, repeat: Infinity, ease: "linear" }
                }}
            />
        </svg>
    </motion.div>
);
