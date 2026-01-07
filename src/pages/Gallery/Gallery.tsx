import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Beaker, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LabBackground } from '../../components/ui/LabBackground';
import { GlassPanel } from '../../components/ui/GlassPanel';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'labs' | 'editor';

export const Gallery: React.FC<{ onSelectLab: (id: string) => void }> = ({ onSelectLab }) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('labs');

  const labs = [
    {
      id: 'useState',
      title: 'useState 实验室',
      description: '探索状态的本质。理解 Hook 链表、Update Queue 以及函数式更新的奥秘。',
      icon: <Beaker className="w-6 h-6 text-blue-400" />,
      color: 'blue'
    },
    {
      id: 'useEffect',
      title: 'useEffect 实验室',
      description: '掌握副作用的时机。可视化依赖对比、Cleanup 执行以及 commit 阶段的流程。',
      icon: <Beaker className="w-6 h-6 text-purple-400" />,
      color: 'purple'
    }
  ];

  return (
    <div className="flex flex-col h-screen w-screen text-white overflow-hidden font-sans relative">
      <LabBackground />

      {/* Header Tabs */}
      <header className="flex items-center justify-center p-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
        <GlassPanel className="flex p-1 rounded-xl bg-black/40 border-white/5">
          <button
            onClick={() => setActiveTab('labs')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
              activeTab === 'labs' ? "bg-white/10 text-white shadow-lg backdrop-blur-sm" : "text-gray-400 hover:text-white"
            )}
          >
            <LayoutGrid size={16} />
            Hook 实验室
          </button>
          <button
            disabled
            className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2 cursor-not-allowed opacity-50"
          >
            <Lock size={16} />
            自由编辑器 (Coming Soon)
          </button>
        </GlassPanel>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            React Internals Lab
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mb-12 text-lg"
          >
            不仅仅是文档，而是深入内存的交互式可视化体验。
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {labs.map((lab, index) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectLab(lab.id)}
                className="group relative bg-[#1e1e22] rounded-2xl p-6 border border-white/5 cursor-pointer overflow-hidden"
              >
                {/* Glow Effect */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl",
                  lab.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                )} />

                <div className="relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/5",
                    lab.color === 'blue' ? 'group-hover:bg-blue-500/20' : 'group-hover:bg-purple-500/20'
                  )}>
                    {lab.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{lab.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{lab.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
