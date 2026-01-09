import React, { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { ChevronLeft, Code, Eye } from 'lucide-react';
import type { Scenario } from '../../data/scenarios';

interface OverlayProps {
    scenario?: Scenario;
    onBack: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ scenario, onBack }) => {
    const {
        phase,
        count,
        snapshotValue,
        updateQueue,
        isLocked,
        showSummary,
        summaryText,
        lastRun,
        dispatchUpdate,
        dispatchBatch,
        reset
    } = useSimulationStore();
    const [showCode, setShowCode] = useState(false); // Default closed since we have 3D wall

    // Disable buttons if not Closure Trap scenario (for now)
    const isClosureTrap = scenario?.id === 'closure-trap';
    const isUpdaterFunction = scenario?.id === 'updater-function';

    const handleBatchRun = () => {
        dispatchBatch([
            { type: 'constant', val: count + 1 },
            { type: 'constant', val: count + 1 },
            { type: 'constant', val: count + 1 }
        ]);
    };

    const handleFunctionalBatchRun = () => {
        dispatchBatch([
            { type: 'function', val: 'n => n + 1' },
            { type: 'function', val: 'n => n + 1' },
            { type: 'function', val: 'n => n + 1' }
        ]);
    };

    // Derived insight data for the mini storyboard
    const captured = snapshotValue ?? lastRun?.captured ?? count;
    const payloads = updateQueue.length
        ? updateQueue.map(u => u.visualLabel)
        : (lastRun?.payloads ?? []);
    const committed = lastRun?.committed ?? (phase === 'COMMIT' ? count : null);

    return (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-50">
            {/* Header */}
            <div className="flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-4 pointer-events-auto">
                     <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors self-start"
                     >
                        <ChevronLeft size={20} /> BACK TO LAB
                     </button>

                    {/* Simplified Title Area */}
                    <div>
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                            {scenario?.title.split('/')[0] || 'React Hypercube'}
                        </h1>
                         <div className="text-sm text-cyan-200/60 font-mono mt-1 tracking-widest uppercase">
                            {scenario?.title.split('/')[1] || 'React 超立方体'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 pointer-events-auto">
                    <div className="bg-black/50 backdrop-blur border border-white/10 px-4 py-2 rounded-lg text-right">
                        <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Phase / 阶段</div>
                        <div className={`text-xl font-mono font-bold ${phase === 'RENDER' ? 'text-yellow-400' : 'text-green-400'}`}>
                            {phase}
                        </div>
                    </div>
                     {/* 3D Scene has built-in code wall, so we hide/toggle the overlay viewer */}
                     {/* Keeping the button just in case user wants raw text view */}
                     <button
                        onClick={() => setShowCode(!showCode)}
                        className="mt-2 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded text-xs text-gray-300 transition-all"
                    >
                        {showCode ? <Eye size={14}/> : <Code size={14}/>}
                        {showCode ? 'HIDE RAW SOURCE' : 'VIEW RAW SOURCE'}
                    </button>
                </div>
            </div>

            {/* Source Code Viewer Overlay - Default Hidden now as we have 3D CodeWall */}
            {/* Logic inverted: Show only if explicitly requested, as 3D wall is primary */}
            {showCode && scenario && (
                <div className="absolute top-48 left-8 w-[450px] pointer-events-auto z-40 shadow-2xl opacity-90 hover:opacity-100 transition-opacity">
                    <div className="bg-[#1e1e1e]/90 backdrop-blur rounded-lg border border-white/10 overflow-hidden font-mono text-xs">
                        <div className="bg-[#2d2d2d]/80 px-4 py-2 text-gray-400 border-b border-white/5 flex justify-between items-center">
                            <span>Counter.tsx (Raw)</span>
                            <span className="text-[10px] opacity-50 bg-black/30 px-2 py-0.5 rounded">READ-ONLY</span>
                        </div>
                        <pre className="p-4 text-gray-300 overflow-x-auto custom-scrollbar max-h-[60vh]">
                            <code>{scenario.code}</code>
                        </pre>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-4 items-end pointer-events-auto">
                <div className="flex flex-col gap-2">
                    {isClosureTrap ? (
                        <>
                            <button
                                onClick={handleBatchRun}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-mono font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95"
                            >
                                Run handleClick() (3x updates)
                            </button>
                            <div className="text-[10px] text-gray-400 max-w-[200px] leading-tight">
                                Execute the problematic handler: calls setCount(count+1) three times.
                                <br/>
                                <span className="text-gray-500">执行问题代码：连续调用三次 setCount(count+1)。</span>
                            </div>
                        </>
                    ) : (
                        // Standard Single Button for other scenarios
                        <button
                            onClick={() => dispatchUpdate('constant', count + 1)}
                            className="bg-gray-800 text-gray-500 px-6 py-3 rounded-lg font-mono font-bold cursor-not-allowed border border-white/5"
                            disabled
                        >
                            setCount(count + 1)
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    {isUpdaterFunction ? (
                        <>
                            <button
                                onClick={handleFunctionalBatchRun}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-mono font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all active:scale-95"
                            >
                                Run Functional Update (3x)
                            </button>
                            <div className="text-[10px] text-gray-400 max-w-[200px] leading-tight">
                                Execute chain with Updater Functions: links state queue dynamically.
                                <br/>
                                <span className="text-gray-500">执行函数式更新链：动态链接状态队列。</span>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => dispatchUpdate('function', 'n => n + 1')}
                            disabled={true}
                            className="bg-gray-800 text-gray-500 px-6 py-3 rounded-lg font-mono font-bold cursor-not-allowed border border-white/5"
                        >
                            setCount(n ={'>'} n + 1)
                        </button>
                    )}
                </div>

                <button
                    onClick={reset}
                    className="ml-auto border border-red-500/50 text-red-400 px-4 py-2 rounded hover:bg-red-950/30 text-sm"
                >
                    RESET SYSTEM / 重置系统
                </button>
            </div>

            {/* Storyboard: show why 3x setCount(count+1) => 1 */}
            <div className="mt-6 max-w-5xl pointer-events-auto">
                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/60 mb-2 font-bold">
                    Closure Trap Storyboard / 闭包陷阱分解
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-xl">
                        <div className="text-[11px] text-rose-200/80 font-bold uppercase mb-1">Step 1 · Snapshot</div>
                        <div className="text-3xl font-mono text-white">{captured}</div>
                        <p className="text-xs text-gray-300 mt-1">
                            The handler closes over this frozen value. / 处理函数捕获并锁住了这个值。
                        </p>
                        {isLocked && (
                            <div className="mt-2 text-[10px] px-2 py-1 rounded bg-rose-500/20 border border-rose-400/40 text-rose-100 inline-flex">
                                LOCKED · 闭包冻结
                            </div>
                        )}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-xl">
                        <div className="text-[11px] text-amber-200/80 font-bold uppercase mb-1">Step 2 · Packets</div>
                        <div className="text-lg font-mono text-amber-100 leading-relaxed space-y-1">
                            {payloads.length === 0 ? (
                                <div className="text-gray-500 text-sm">Awaiting dispatch...</div>
                            ) : (
                                payloads.map((p, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-amber-50">
                                            #{i + 1}
                                        </span>
                                        <span>{p}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-gray-300 mt-2">
                            Three packets share the same snapshot payload. / 三封信都携带同一份快照。
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shadow-xl">
                        <div className="text-[11px] text-cyan-200/80 font-bold uppercase mb-1">Step 3 · Commit</div>
                        <div className="text-3xl font-mono text-cyan-100">
                            {committed !== null ? committed : '…'}
                        </div>
                        <p className="text-xs text-gray-300 mt-1">
                            Queue collapses into final state: only +1 survives. / 队列坍缩后只得到 1。
                        </p>
                        {showSummary && summaryText && (
                            <div className="mt-2 text-[11px] text-cyan-100/80 leading-snug">
                                {summaryText}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Logs Console - REMOVED per user request for cleaner UI */}
            {/*
            <div className="absolute right-8 top-32 w-80 h-[400px] bg-black/80 backdrop-blur border-l-2 border-cyan-500/30 p-4 overflow-y-auto font-mono text-xs flex flex-col gap-2 mask-linear-fade z-30">
                <div className="sticky top-0 bg-black/90 pb-2 border-b border-white/10 text-cyan-500 font-bold uppercase tracking-wider mb-2">
                    Kernel Log / 内核日志
                </div>
                {logs.map((log, i) => (
                    <div key={i} className="text-gray-300 border-l border-white/10 pl-2">
                        <span className="text-gray-600 mr-2">[{i.toString().padStart(2, '0')}]</span>
                        {log}
                    </div>
                ))}
                <div className="h-4" />
            </div>
            */}
        </div>
    );
};
