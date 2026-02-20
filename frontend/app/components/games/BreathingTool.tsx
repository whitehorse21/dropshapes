'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square } from 'lucide-react';
import GameLayout from './GameLayout';

export default function BreathingTool() {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
    const [cycleCount, setCycleCount] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setPhase('idle');
            return;
        }

        let currentTimer: NodeJS.Timeout;

        const startBreathing = () => {
            setPhase('inhale');
            currentTimer = setTimeout(() => {
                setPhase('hold');
                currentTimer = setTimeout(() => {
                    setPhase('exhale');
                    currentTimer = setTimeout(() => {
                        setCycleCount(c => c + 1);
                        startBreathing();
                    }, 8000);
                }, 7000);
            }, 4000);
        };

        if (isActive && phase === 'idle') {
            startBreathing();
        }

        return () => clearTimeout(currentTimer);
    }, [isActive]);

    return (
        <GameLayout title="Breathing Focus" subtitle="Mindfulness">
            <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto gap-12">

                {/* Breathing Visual */}
                <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
                    {/* Background Pulse */}
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0) 70%)',
                        }}
                        animate={{
                            scale: phase === 'inhale' ? 1.6 : phase === 'hold' ? 1.6 : 0.8,
                            opacity: phase === 'idle' ? 0 : 1,
                        }}
                        transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.5, ease: "easeInOut" }}
                    />

                    {/* Main Circle */}
                    <motion.div
                        className="w-full h-full rounded-full border-[8px] flex items-center justify-center relative z-10 backdrop-blur-2xl shadow-[0_0_80px_rgba(59,130,246,0.2)]"
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                        }}
                        animate={{
                            scale: phase === 'inhale' ? 1 : phase === 'hold' ? 1 : 0.7,
                            borderColor: phase !== 'idle' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(255, 255, 255, 0.15)',
                            boxShadow: phase !== 'idle' ? '0 0 60px rgba(59, 130, 246, 0.4)' : '0 0 0 rgba(0,0,0,0)'
                        }}
                        transition={{
                            duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.5,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="flex flex-col items-center">
                            <motion.div
                                key={phase}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center"
                            >
                                {phase === 'idle' && (
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="text-7xl">🌬️</span>
                                        <span className="text-xl text-white/80 font-medium">Ready to relax?</span>
                                    </div>
                                )}
                                {phase !== 'idle' && (
                                    <>
                                        <h2 className="text-6xl md:text-7xl font-bold text-white mb-3 tracking-tight">
                                            {phase === 'inhale' && "Inhale"}
                                            {phase === 'hold' && "Hold"}
                                            {phase === 'exhale' && "Exhale"}
                                        </h2>
                                        <p className="text-blue-200 font-semibold uppercase tracking-[0.3em] text-base">
                                            {phase === 'inhale' ? 'Deeply' : phase === 'hold' ? 'Steady' : 'Slowly'}
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center w-full max-w-sm gap-8">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl ${isActive
                                ? 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/15 hover:border-red-400/40 hover:text-red-300 backdrop-blur-xl'
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.4)]'
                            }`}
                        aria-label={isActive ? "Stop Session" : "Start Session"}
                    >
                        {isActive ? (
                            <>
                                <Square size={20} fill="currentColor" /> End Session
                            </>
                        ) : (
                            <>
                                <Play size={24} fill="currentColor" /> Start Breathing
                            </>
                        )}
                    </button>

                    {/* Instructions / Stats */}
                    <AnimatePresence mode="wait">
                        {isActive ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-white/60 font-medium flex items-center gap-3 text-base"
                            >
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                                {cycleCount} cycles completed
                            </motion.div>
                        ) : (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-white/50 text-base text-center px-4 leading-relaxed"
                            >
                                Follow the circle: <span className="text-white/70 font-medium">Inhale</span> as it expands, <span className="text-white/70 font-medium">hold</span> when full, <span className="text-white/70 font-medium">exhale</span> as it shrinks.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </GameLayout>
    );
}
