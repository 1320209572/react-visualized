import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Maximize2, Layers, Cpu, Code2, Smartphone, GitBranch } from 'lucide-react';
import { MemoryInspector } from '../../components/ui/MemoryInspector';
import { CodeAndDispatchPanel } from '../../components/ui/CodeAndDispatchPanel';
import { FiberArchitecturePanel } from '../../components/ui/FiberArchitecturePanel';
import { CallStackPanel } from '../../components/ui/CallStackPanel';

const FiberDeepDiveStudio: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(30);

    return (
        <div className="w-screen h-screen bg-[#0B0E14] text-slate-300 overflow-hidden font-mono selection:bg-cyan-500/30">
            {/* Global SVG Layer for Layout Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
                <defs>
                    <filter id="glow-connector">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="link-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                {/* Curve from Phone Button (approx bottom-left) to Stack Panel (approx bottom-right) */}
                {/* Coordinates are approximate based on grid layout percentages */}
                <path
                    d="M 250 850 C 350 850, 350 750, 480 750"
                    fill="none"
                    stroke="url(#link-gradient)"
                    strokeWidth="2"
                    filter="url(#glow-connector)"
                    className="opacity-60"
                />
            </svg>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-12 grid-rows-12 h-full w-full gap-2 p-2 relative z-0">

                {/* 1. Code Editor Panel (Top Left) */}
                <div className="col-span-5 row-span-7 bg-transparent flex flex-col overflow-hidden">
                    {/* Replaced placeholder with new Component */}
                    <CodeAndDispatchPanel />
                </div>

                {/* 2. Fiber Architecture (Top Right) */}
                <div className="col-span-7 row-span-7 bg-transparent flex flex-col overflow-hidden">
                    <FiberArchitecturePanel />
                </div>

                {/* 3. Device Simulator & Call Stack (Bottom Left) */}
                <div className="col-span-4 row-span-5 flex flex-col gap-2">
                    {/* 3a. Device Simulator (Top Half) */}
                    <div className="flex-1 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col">
                        <div className="h-9 border-b border-white/5 flex items-center justify-between px-4 bg-white/5">
                            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                                <Smartphone size={11} className="text-slate-400" />
                                <span>RENDER OUTPUT</span>
                            </div>
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-center bg-black/40">
                            {/* Dark Mode Phone Frame */}
                            <div className="w-[140px] h-[240px] border-[3px] border-slate-800 rounded-3xl bg-[#050505] relative overflow-hidden shadow-2xl ring-1 ring-white/5">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-900 rounded-b-xl z-20" />

                                {/* Screen Content */}
                                <div className="p-3 mt-6 flex flex-col items-center justify-center h-full gap-4 text-slate-200">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] uppercase tracking-widest text-slate-600 mb-1">Count</span>
                                        <div className="text-4xl font-bold font-mono text-white">0</div>
                                    </div>
                                    <button className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold rounded-lg transition-colors border border-slate-700">
                                        Increment
                                    </button>
                                </div>

                                {/* Home Indicator */}
                                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-slate-800 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* 3b. Call Stack (Bottom Half) */}
                    <div className="flex-1">
                        <CallStackPanel />
                    </div>
                </div>

                {/* 4. Memory & Hook Inspector (Bottom Right) */}
                <div className="col-span-8 row-span-5 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col relative overflow-hidden">
                     {/* Integrate MemoryInspector here */}
                     <MemoryInspector />
                </div>
            </div>

            {/* Bottom Floating Control Bar (Chronos Player) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[580px] h-14 bg-[#0F1218]/80 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex items-center px-6 gap-6 z-50 ring-1 ring-white/5">

                {/* Play Controls */}
                <div className="flex items-center gap-2">
                    <IconButton icon={<SkipBack size={16} />} />
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isPlaying
                            ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            : 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105'
                        }`}
                    >
                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <IconButton icon={<SkipForward size={16} />} />
                </div>

                {/* Timeline Tracks */}
                <div className="flex-1 flex flex-col gap-1 py-2 group cursor-pointer">
                    {/* Label Row */}
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                        <span>Render</span>
                        <span>Commit</span>
                    </div>

                    {/* Tracks */}
                    <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                        {/* Progress Bar */}
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Markers */}
                        <div className="absolute top-0 left-[20%] w-0.5 h-full bg-white/20" />
                        <div className="absolute top-0 left-[60%] w-0.5 h-full bg-white/20" />
                    </div>
                </div>

                {/* Meta Controls */}
                <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                     <div className="flex flex-col items-end">
                         <span className="text-[9px] text-slate-500 font-mono">STEP</span>
                         <span className="text-[10px] font-bold text-cyan-400 font-mono">04/12</span>
                     </div>
                     <IconButton icon={<Layers size={14} />} />
                     <IconButton icon={<Maximize2 size={14} />} />
                </div>
            </div>

            {/* Background Gradient Mesh (Subtle) */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/5 blur-[120px] rounded-full pointer-events-none" />
        </div>
    );
};

// Reusable Components
const Badge = ({ label, color }: { label: string, color: 'cyan' | 'amber' | 'purple' }) => {
    const colors = {
        cyan: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5',
        amber: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
        purple: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${colors[color]} font-mono`}>
            {label}
        </span>
    );
};

const IconButton = ({ icon }: { icon: React.ReactNode }) => (
    <button className="p-1.5 rounded-full text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
        {icon}
    </button>
);

export default FiberDeepDiveStudio;
