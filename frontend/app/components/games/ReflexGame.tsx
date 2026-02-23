'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Zap, AlertTriangle } from 'lucide-react';
import GameLayout from './GameLayout';

type GameState = 'idle' | 'waiting' | 'ready' | 'tooEarly' | 'result';

export default function ReflexGame() {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [startTime, setStartTime] = useState(0);
    const [score, setScore] = useState<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setGameState('waiting');
        const delay = Math.floor(Math.random() * 3000) + 2000;
        timeoutRef.current = setTimeout(() => {
            setGameState('ready');
            setStartTime(performance.now());
        }, delay);
    };

    const handleClick = () => {
        if (gameState === 'waiting') {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setGameState('tooEarly');
        } else if (gameState === 'ready') {
            const endTime = performance.now();
            setScore(Math.floor(endTime - startTime));
            setGameState('result');
        }
    };

    const resetGame = () => {
        setGameState('idle');
        setScore(null);
    };

    return (
        <GameLayout title="Reflex Challenge" subtitle="Reaction">
            <div className="w-full min-h-[320px] flex flex-col items-center justify-center max-w-xl mx-auto px-3 sm:px-4">

                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-800/50 border border-white/10 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl text-center backdrop-blur-xl w-full shadow-2xl"
                        >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-yellow-500/25 to-amber-500/25 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg shadow-yellow-500/20 border border-amber-400/20">
                                <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300" strokeWidth={2} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Reaction Test</h2>
                            <p className="text-slate-300 mb-8 sm:mb-10 leading-relaxed text-sm sm:text-base">
                                When the screen turns <span className="text-green-400 font-bold">GREEN</span>, tap as fast as you can.
                            </p>
                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:from-yellow-300 hover:to-amber-400 rounded-2xl font-bold transition-all shadow-[0_0_40px_rgba(251,191,36,0.25)] text-lg flex items-center justify-center gap-3 border border-amber-400/20"
                            >
                                <Play size={22} fill="currentColor" /> Start Test
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'waiting' && (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onMouseDown={handleClick}
                            className="absolute inset-x-3 inset-y-28 sm:inset-x-4 sm:inset-y-32 md:inset-0 md:relative w-[calc(100%-24px)] sm:w-[calc(100%-32px)] min-h-[280px] sm:min-h-[320px] md:min-h-[384px] md:h-96 bg-gradient-to-br from-red-500/25 to-rose-900/35 border-2 border-red-500/40 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center cursor-pointer select-none hover:from-red-500/30 hover:to-rose-900/40 transition-all shadow-2xl shadow-red-500/25 backdrop-blur-xl"
                        >
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 mb-2 sm:mb-3 text-center px-2">Wait for Green...</h3>
                            <p className="text-red-300/70 font-medium text-base sm:text-lg">Do not click yet.</p>
                        </motion.div>
                    )}

                    {gameState === 'ready' && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onMouseDown={handleClick}
                            className="absolute inset-x-3 inset-y-28 sm:inset-x-4 sm:inset-y-32 md:inset-0 md:relative w-[calc(100%-24px)] sm:w-[calc(100%-32px)] min-h-[280px] sm:min-h-[320px] md:min-h-[384px] md:h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center cursor-pointer select-none shadow-[0_0_80px_rgba(34,197,94,0.5)] border-4 border-green-300/80"
                        >
                            <h3 className="text-5xl md:text-6xl font-bold text-black mb-4 uppercase tracking-wide drop-shadow-lg">CLICK NOW!</h3>
                            <Zap size={72} className="text-black/40" strokeWidth={2.5} />
                        </motion.div>
                    )}

                    {gameState === 'tooEarly' && (
                        <motion.div
                            key="tooEarly"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-800/50 border border-white/10 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl text-center backdrop-blur-xl w-full shadow-2xl"
                        >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500/25 to-rose-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg shadow-red-500/20 border border-red-400/20">
                                <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" strokeWidth={2} />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Too Early!</h2>
                            <p className="text-slate-300 mb-8 sm:mb-10 leading-relaxed text-sm sm:text-base">
                                You tapped before the light turned green.
                            </p>
                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-400 hover:to-rose-500 rounded-2xl font-bold transition-all shadow-[0_0_40px_rgba(239,68,68,0.25)] text-lg flex items-center justify-center gap-3 border border-red-400/20"
                            >
                                <RotateCcw size={22} /> Try Again
                            </button>
                        </motion.div>
                    )}

                    {gameState === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800/50 border border-white/10 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl text-center backdrop-blur-xl w-full shadow-2xl"
                        >
                            <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-3 tracking-tighter">
                                {score}<span className="text-2xl sm:text-3xl text-slate-400 font-medium ml-2">ms</span>
                            </div>
                            <p className="text-slate-300 mb-8 sm:mb-10 text-base sm:text-lg">
                                {score! < 200 ? '⚡ Inhuman reflexes!' : score! < 300 ? '🚀 Great speed!' : '🐢 Keep practicing!'}
                            </p>
                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 rounded-2xl font-bold transition-all shadow-[0_0_40px_rgba(59,130,246,0.25)] text-lg flex items-center justify-center gap-3 border border-blue-400/20"
                            >
                                <RotateCcw size={22} /> Test Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
}
