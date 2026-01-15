import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';

type StackFrame = {
    id: string;
    name: string;
    type: 'global' | 'function' | 'event';
    variables: { name: string; value: string; highlight?: boolean }[];
    isActive?: boolean;
};

const mockStackFrames: StackFrame[] = [
    {
        id: 'global',
        name: '(global)',
        type: 'global',
        variables: [],
        isActive: false,
    },
    {
        id: 'app',
        name: 'App()',
        type: 'function',
        variables: [
            { name: 'useState', value: '[Function]' },
        ],
        isActive: false,
    },
    {
        id: 'counter',
        name: 'Counter()',
        type: 'function',
        variables: [
            { name: 'count', value: '0', highlight: true },
            { name: 'setCount', value: '[Function]' },
        ],
        isActive: false,
    },
    {
        id: 'handleClick',
        name: 'handleClick()',
        type: 'event',
        variables: [
            { name: 'count', value: '0', highlight: true },
        ],
        isActive: true,
    },
];

export const CallStackPanel: React.FC = () => {
    return (
        <div className="w-full h-full flex flex-col bg-[#0B0E14]/90 border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-white/[0.02] backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">
                    <Layers size={12} className="text-purple-400" />
                    <span>CALL STACK</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                    <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded">
                        {mockStackFrames.filter(f => f.isActive).length} Active
                    </span>
                </div>
            </div>

            {/* Stack Frames */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {mockStackFrames.slice().reverse().map((frame, index) => (
                    <StackFrameCard key={frame.id} frame={frame} depth={mockStackFrames.length - index - 1} />
                ))}
            </div>

            {/* Bottom Hint */}
            <div className="h-8 border-t border-white/5 flex items-center justify-center px-4 bg-white/[0.01]">
                <div className="text-[9px] text-slate-500 font-mono flex items-center gap-2">
                    <ChevronRight size={10} className="text-purple-400" />
                    <span>Top of stack is currently executing</span>
                </div>
            </div>
        </div>
    );
};

const StackFrameCard: React.FC<{ frame: StackFrame; depth: number }> = ({ frame, depth }) => {
    const typeColors = {
        global: 'border-slate-600 bg-slate-900/40',
        function: 'border-cyan-500/30 bg-cyan-950/20',
        event: 'border-purple-500/50 bg-purple-950/30',
    };

    const typeIcons = {
        global: '🌐',
        function: '⚡',
        event: '👆',
    };

    return (
        <div
            className={`
                relative rounded-lg border-l-4 p-3 transition-all
                ${frame.isActive ? 'ring-2 ring-purple-400/50 shadow-lg shadow-purple-500/20' : ''}
                ${typeColors[frame.type]}
            `}
            style={{
                marginLeft: `${depth * 12}px`,
            }}
        >
            {/* Frame Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-base">{typeIcons[frame.type]}</span>
                    <span className="text-[11px] font-bold text-white font-mono">
                        {frame.name}
                    </span>
                    {frame.isActive && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-purple-500 text-white rounded uppercase tracking-wider">
                            ACTIVE
                        </span>
                    )}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">
                    Depth: {depth}
                </span>
            </div>

            {/* Variables */}
            {frame.variables.length > 0 && (
                <div className="space-y-1">
                    {frame.variables.map((variable, idx) => (
                        <div
                            key={idx}
                            className={`
                                flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded
                                ${variable.highlight
                                    ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
                                    : 'bg-white/5 text-slate-400'
                                }
                            `}
                        >
                            <span className="font-semibold">{variable.name}</span>
                            <span className="text-slate-500">:</span>
                            <span className={variable.highlight ? 'text-amber-400 font-bold' : ''}>
                                {variable.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Active Indicator */}
            {frame.isActive && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-lg shadow-purple-400/50" />
                </div>
            )}
        </div>
    );
};
