import React from 'react';
import { ArrowRight, Box, Activity, Layers, Repeat } from 'lucide-react';

interface HookCollectionPageProps {
  onSelectHook: (hookType: 'useState' | 'useEffect' | 'useRef') => void;
}

const HOOKS = [
    {
        id: 'useState',
        title: 'useState',
        description: 'State persistence & functional updates.',
        icon: Box,
        color: 'text-purple-400',
        borderColor: 'group-hover:border-purple-500/50',
        bgGlow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]'
    },
    {
        id: 'useEffect',
        title: 'useEffect',
        description: 'Side effects, cleanup & dependency arrays.',
        icon: Activity,
        color: 'text-cyan-400',
        borderColor: 'group-hover:border-cyan-500/50',
        bgGlow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]'
    },
    {
        id: 'useRef',
        title: 'useRef',
        description: 'Mutable references & DOM access.',
        icon: Layers,
        color: 'text-orange-400',
        borderColor: 'group-hover:border-orange-500/50',
        bgGlow: 'group-hover:shadow-[0_0_30px_rgba(251,146,60,0.15)]'
    }
] as const;

export const HookCollectionPage: React.FC<HookCollectionPageProps> = ({ onSelectHook }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-16">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            REACT LAB
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl font-light">
            An interactive 3D playground to dismantle, visualize, and grok React's internal physics.
            <br />
            <span className="text-gray-500 text-sm mt-2 block">
              拆解、可视化、领悟 React 内部物理机制的 3D 交互式实验室。
            </span>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOOKS.map((hook) => (
            <button
              key={hook.id}
              onClick={() => onSelectHook(hook.id)}
              className={`group relative bg-white/5 border border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 transition-all hover:scale-[1.02] overflow-hidden ${hook.borderColor} ${hook.bgGlow}`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                <hook.icon size={80} />
              </div>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/10 text-gray-400">
                  CORE HOOK
                </span>
              </div>

              <h3 className={`text-4xl font-bold mb-2 ${hook.color} font-mono tracking-tighter`}>
                {hook.title}
              </h3>

              <p className="text-sm text-gray-400 mb-8 line-clamp-2 min-h-[40px]">
                {hook.description}
              </p>

              <div className="flex items-center text-sm font-bold text-white group-hover:translate-x-2 transition-transform uppercase tracking-widest">
                EXPLORE <ArrowRight size={16} className="ml-2" />
              </div>
            </button>
          ))}

          {/* Coming Soon */}
          <div className="border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-600 gap-4 opacity-50 min-h-[300px]">
             <Repeat size={48} />
             <span className="font-mono text-sm">MORE HOOKS COMING SOON</span>
          </div>
        </div>
      </div>
    </div>
  );
};
