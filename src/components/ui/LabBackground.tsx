import React from 'react';
import { motion } from 'framer-motion';

export const LabBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] bg-[#050505] overflow-hidden">
      {/* Base Grid */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Breathing Dots */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-dots opacity-30"
      />

      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen" />
    </div>
  );
};
