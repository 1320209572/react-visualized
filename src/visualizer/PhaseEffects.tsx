import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStepController } from '../hooks/useStepController';

export const PhaseEffects: React.FC = () => {
    const { currentStep } = useStepController();

    // 1. VDOM_GEN: Purple Ripple on Stack
    // We need coordinates of Stack Container. For now, assume fixed left panel.

    // 2. COMMIT_SYNC: Green Beam from Fiber to Phone
    // Fiber is center, Phone is bottom left.

    return (
        <div className="fixed inset-0 pointer-events-none z-[8000] overflow-hidden">
            <AnimatePresence>
                {currentStep === 'VDOM_GEN' && (
                    <motion.div
                        key="vdom-ripple"
                        initial={{ opacity: 0.8, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute left-[10%] top-[40%] w-[300px] h-[400px] border-2 border-purple-500 rounded-xl shadow-[0_0_50px_rgba(168,85,247,0.5)]"
                    />
                )}

                {currentStep === 'COMMIT_SYNC' && (
                    <motion.div
                        key="commit-beam"
                        initial={{ pathLength: 0, opacity: 1 }}
                        animate={{ pathLength: 1, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <svg width="100%" height="100%">
                            <motion.line
                                x1="60%" y1="40%" // Fiber Tree approx
                                x2="15%" y2="80%" // Phone Preview approx
                                stroke="#22c55e"
                                strokeWidth="4"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.circle
                                r="10"
                                fill="#4ade80"
                                filter="url(#glow-green)"
                                offset="100%"
                                animate={{
                                    offsetDistance: "100%",
                                    cx: ["60%", "15%"],
                                    cy: ["40%", "80%"]
                                }}
                                // Use framer motion layout animation for position since SVG motion path is complex
                                style={{
                                    left: "15%", top: "80%", position: "absolute" // Target
                                }}
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
