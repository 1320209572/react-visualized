import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStepController } from '../../hooks/useStepController';
import { Terminal } from 'lucide-react';

export const SubtitleBar: React.FC = () => {
    const { definition } = useStepController();

    return (
        <div className="fixed bottom-0 left-0 w-full z-[100] pointer-events-none flex justify-center pb-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={definition.id + definition.description}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="bg-black/80 backdrop-blur-md border-t border-x border-cyan-500/30 px-8 py-4 rounded-t-2xl shadow-[0_-5px_30px_rgba(6,182,212,0.2)] max-w-3xl flex items-center gap-4"
                >
                    <div className="p-2 bg-cyan-900/30 rounded-lg">
                        <Terminal size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">
                            SYSTEM LOG // {definition.phase} PHASE
                        </span>
                        <span className="text-sm font-medium text-gray-200 font-sans tracking-wide">
                            {definition.description}
                        </span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
