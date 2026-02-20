'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Zap } from 'lucide-react';
import GameLayout from './GameLayout';

const COLORS = [
    { id: 0, color: 'bg-green-500', active: 'bg-green-400 shadow-[0_0_60px_rgba(74,222,128,0.7)]', border: 'border-green-400' },
    { id: 1, color: 'bg-red-500', active: 'bg-red-400 shadow-[0_0_60px_rgba(248,113,113,0.7)]', border: 'border-red-400' },
    { id: 2, color: 'bg-yellow-500', active: 'bg-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.7)]', border: 'border-yellow-400' },
    { id: 3, color: 'bg-blue-500', active: 'bg-blue-400 shadow-[0_0_60px_rgba(96,165,250,0.7)]', border: 'border-blue-400' },
];

export default function PatternGame() {
    const [sequence, setSequence] = useState<number[]>([]);
    const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
    const [userTurn, setUserTurn] = useState(false);
    const [userStep, setUserStep] = useState(0);
    const [startScreen, setStartScreen] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [activePad, setActivePad] = useState<number | null>(null);

    const playSequence = async (seq: number[]) => {
        setUserTurn(false);
        setUserStep(0);

        await new Promise(r => setTimeout(r, 500));

        for (let i = 0; i < seq.length; i++) {
            const padId = seq[i];
            setActivePad(padId);
            await new Promise(r => setTimeout(r, 600));
            setActivePad(null);
            await new Promise(r => setTimeout(r, 200));
        }
        setUserTurn(true);
    };

    const startGame = () => {
        setStartScreen(false);
        setGameOver(false);
        setSequence([]);
        addToSequence([]);
    };

    const addToSequence = (currentSeq: number[]) => {
        const nextColor = Math.floor(Math.random() * 4);
        const newSeq = [...currentSeq, nextColor];
        setSequence(newSeq);
        playSequence(newSeq);
    };

    const handlePadClick = (id: number) => {
        if (!userTurn || gameOver) return;

        setActivePad(id);
        setTimeout(() => setActivePad(null), 200);

        if (id !== sequence[userStep]) {
            setGameOver(true);
            setUserTurn(false);
        } else {
            const nextStep = userStep + 1;
            if (nextStep === sequence.length) {
                setUserTurn(false);
                setTimeout(() => addToSequence(sequence), 1000);
            } else {
                setUserStep(nextStep);
            }
        }
    };

    return (
        <GameLayout title="Pattern Logic" subtitle="Memory">
            <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto gap-10">

                {startScreen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 border-2 border-white/10 p-10 rounded-[40px] text-center backdrop-blur-xl w-full shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/10">
                            <Zap size={48} className="text-purple-300" strokeWidth={2} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Pattern Sequence</h2>
                        <p className="text-white/60 mb-10 mx-auto max-w-xs leading-relaxed text-base">
                            Memorize the sequence of lights and repeat it. The pattern gets longer each round.
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-[1.02] active:scale-[0.98] rounded-3xl font-bold transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] text-lg flex items-center justify-center gap-3"
                        >
                            <Play size={22} fill="currentColor" /> Start Game
                        </button>
                    </motion.div>
                ) : gameOver ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 border-2 border-white/10 p-10 rounded-[40px] text-center backdrop-blur-xl w-full shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/10">
                            <RotateCcw size={48} className="text-red-400" strokeWidth={2} />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-4">Game Over</h2>
                        <p className="text-white/60 mb-10 text-lg">
                            You reached Level <span className="text-white font-bold text-2xl">{sequence.length}</span>
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-[1.02] active:scale-[0.98] rounded-3xl font-bold transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)] text-lg flex items-center justify-center gap-3"
                        >
                            <Play size={22} fill="currentColor" /> Try Again
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Status */}
                        <div className="mb-4 text-center">
                            <span className="text-white/60 uppercase tracking-[0.3em] text-xs font-bold">Level</span>
                            <div className="text-5xl md:text-6xl font-bold text-white my-2">{sequence.length}</div>
                            <div className="text-base text-blue-300 h-7 font-semibold">
                                {userTurn ? "Your Turn" : "Watch Sequence..."}
                            </div>
                        </div>

                        {/* Game Pads */}
                        <div className="grid grid-cols-2 gap-5">
                            {COLORS.map((col) => (
                                <button
                                    key={col.id}
                                    onMouseDown={() => handlePadClick(col.id)}
                                    className={`w-40 h-40 md:w-48 md:h-48 rounded-[40px] transition-all duration-100 border-4 ${activePad === col.id
                                            ? `${col.active} ${col.border} scale-95`
                                            : `${col.color} opacity-30 hover:opacity-40 border-transparent`
                                        }`}
                                    disabled={!userTurn}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </GameLayout>
    );
}
