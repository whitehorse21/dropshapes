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
            <div className="w-full h-full flex flex-col items-center justify-center max-w-xl mx-auto px-4">

                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/5 border-2 border-white/10 p-10 rounded-[40px] text-center backdrop-blur-xl w-full shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-yellow-500/10">
                                <Zap size={48} className="text-yellow-300" strokeWidth={2} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Reaction Test</h2>
                            <p className="text-white/60 mb-10 leading-relaxed text-base">
                                When the screen turns <span className="text-green-400 font-bold">GREEN</span>, click as fast as you can.
                            </p>
                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-[1.02] active:scale-[0.98] rounded-3xl font-bold transition-all shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] text-lg flex items-center justify-center gap-3"
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
                            className="absolute inset-x-6 inset-y-36 md:inset-0 md:relative w-full h-96 bg-gradient-to-br from-red-500/20 to-rose-900/30 border-2 border-red-500/40 rounded-[40px] flex flex-col items-center justify-center cursor-pointer select-none hover:bg-red-500/25 transition-all shadow-2xl shadow-red-500/20 backdrop-blur-xl"
                        >
                            <h3 className="text-4xl font-bold text-red-400 mb-3">Wait for Green...</h3>
                            <p className="text-red-300/70 font-medium text-lg">Do not click yet.</p>
                        </motion.div>
                    )}

                    {gameState === 'ready' && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onMouseDown={handleClick}
                            className="absolute inset-x-6 inset-y-36 md:inset-0 md:relative w-full h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-[40px] flex flex-col items-center justify-center cursor-pointer select-none shadow-[0_0_100px_rgba(34,197,94,0.5)] border-4 border-green-300"
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
                            className="bg-white/5 border-2 border-white/10 p-10 rounded-[40px] text-center backdrop-blur-xl w-full shadow-2xl"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/10">
                                <AlertTriangle size={48} className="text-red-400" strokeWidth={2} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">Too Early!</h2>
                            <p className="text-white/60 mb-10 leading-relaxed text-base">
                                You clicked before the light turned green.
                            </p>
                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-gradient-to-r from-red-500 to-rose-600 text-white hover:scale-[1.02] active:scale-[0.98] rounded-3xl font-bold transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)] text-lg flex items-center justify-center gap-3"
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
                            className="bg-white/5 border-2 border-white/10 p-10 rounded-[40px] text-center backdrop-blur-xl w-full shadow-2xl"
                        >
                            <div className="text-7xl font-bold text-white mb-3 tracking-tighter">
                                {score}<span className="text-3xl text-white/60 font-medium ml-2">ms</span>
                            </div>
                            <p className="text-white/60 mb-10 text-lg">
                                {score! < 200 ? '⚡ Inhuman reflexes!' : score! < 300 ? '🚀 Great speed!' : '🐢 Keep practicing!'}
                            </p>
                            <button
                                onClick={startGame}
                                className="w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-[1.02] active:scale-[0.98] rounded-3xl font-bold transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] text-lg flex items-center justify-center gap-3"
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
