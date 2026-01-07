import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

export const TutorialOverlay: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[10000] pointer-events-none flex items-start justify-end p-20"
    >
        <div className="relative pointer-events-auto">
            {/* Arrow pointing to Controls */}
            <motion.div
                initial={{ x: 0, y: 0 }}
                animate={{ x: 10, y: -10 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                className="absolute -top-4 -right-4 text-cyan-400"
            >
                <MousePointer2 size={40} className="transform -rotate-90 fill-cyan-400/20" />
            </motion.div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black/90 backdrop-blur-xl border border-cyan-500/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] max-w-sm relative z-[10001]"
            >
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-2xl">🧪</span>
                    <span>实验室就绪</span>
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                    React 渲染引擎已暂停。
                    <br/>
                    点击 <strong className="text-cyan-400">AUTO</strong> 启动模拟，
                    或者使用 <strong className="text-white">Step</strong> 逐行解剖 Hook 的执行过程。
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDismiss();
                    }}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors shadow-lg active:scale-95 transform"
                >
                    开始实验
                </button>
            </motion.div>
        </div>
    </motion.div>
  );
};
