'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy, Play } from 'lucide-react';
import GameLayout from './GameLayout';

import { Heart, Star, Zap, Sun, Moon, Cloud, Music, Ghost } from 'lucide-react';

const ICONS = [Heart, Star, Zap, Sun, Moon, Cloud, Music, Ghost];

interface Card {
    id: number;
    iconId: number;
    isFlipped: boolean;
    isMatched: boolean;
}

export default function MemoryGame() {
    const [gameStarted, setGameStarted] = useState(false);
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const startNewGame = () => {
        setGameStarted(true);
        const selectedIcons = [...ICONS];
        const newCards: Card[] = [];
        selectedIcons.forEach((icon, index) => {
            newCards.push({ id: index * 2, iconId: index, isFlipped: false, isMatched: false });
            newCards.push({ id: index * 2 + 1, iconId: index, isFlipped: false, isMatched: false });
        });

        newCards.sort(() => Math.random() - 0.5);

        setCards(newCards);
        setFlippedIndices([]);
        setMoves(0);
        setIsWon(false);
        setIsLocked(false);
    };

    const handleCardClick = (index: number) => {
        if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            setIsLocked(true);
            checkForMatch(newFlipped[0], newFlipped[1]);
        }
    };

    const checkForMatch = (firstIndex: number, secondIndex: number) => {
        const firstCard = cards[firstIndex];
        const secondCard = cards[secondIndex];

        if (firstCard.iconId === secondCard.iconId) {
            setTimeout(() => {
                const newCards = [...cards];
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setCards(newCards);
                setFlippedIndices([]);
                setIsLocked(false);

                if (newCards.every(c => c.isMatched)) {
                    setIsWon(true);
                }
            }, 500);
        } else {
            setTimeout(() => {
                const newCards = [...cards];
                newCards[firstIndex].isFlipped = false;
                newCards[secondIndex].isFlipped = false;
                setCards(newCards);
                setFlippedIndices([]);
                setIsLocked(false);
            }, 1000);
        }
    };

    return (
        <GameLayout title="Memory Match" subtitle="Cognitive">
            <div className="flex flex-col items-center w-full max-w-lg mx-auto overflow-hidden">

                {!gameStarted && !isWon ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-4 sm:p-6 md:p-8 lg:p-10 bg-slate-800/50 border border-white/10 rounded-2xl sm:rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" aria-hidden />
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500/25 to-pink-500/25 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/20 border border-purple-400/20 relative">
                            <RefreshCw size={48} className="text-purple-300" strokeWidth={2} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Train?</h2>
                        <p className="text-slate-300 mb-10 max-w-xs mx-auto leading-relaxed text-base">
                            Find all <span className="text-white font-semibold">8 matching pairs</span>. Memorize positions and clear the board in as few moves as possible.
                        </p>
                        <button
                            onClick={startNewGame}
                            className="w-full py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 rounded-2xl font-bold transition-all shadow-[0_0_40px_rgba(168,85,247,0.25)] hover:shadow-[0_0_50px_rgba(168,85,247,0.35)] text-lg flex items-center justify-center gap-3 border border-purple-400/20"
                        >
                            <Play size={22} fill="currentColor" /> Start Game
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Stats Bar */}
                        <div className="flex items-center justify-between w-full mb-6 sm:mb-8 px-2">
                            <div className="bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                                <span className="text-slate-400 text-sm font-medium">Moves</span>
                                <span className="text-white font-bold text-xl ml-2">{moves}</span>
                            </div>
                            <button
                                onClick={startNewGame}
                                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm"
                                title="Restart"
                            >
                                <RefreshCw size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Grid - responsive gap; constrain size on small screens */}
                        <div className="w-full max-w-[min(100%,380px)] sm:max-w-full aspect-square mx-auto">
                            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full h-full">
                            {cards.map((card, index) => {
                                const Icon = ICONS[card.iconId];
                                return (
                                    <motion.button
                                        key={card.id}
                                        className="relative w-full h-full rounded-3xl perspective-1000 group focus:outline-none"
                                        onClick={() => handleCardClick(index)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* Front (Hidden) */}
                                        <div
                                            className="absolute inset-0 w-full h-full bg-white/5 border-2 border-white/10 rounded-3xl flex items-center justify-center backface-hidden shadow-lg hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-xl"
                                            style={{ backfaceVisibility: 'hidden' }}
                                        >
                                            <div className="w-10 h-10 opacity-20 text-white">
                                                <div className="w-full h-full rounded-full border-2 border-dashed border-white/40" />
                                            </div>
                                        </div>

                                        {/* Back (Revealed) */}
                                        <div
                                            className={`absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl md:rounded-3xl flex items-center justify-center backface-hidden border-2 shadow-2xl backdrop-blur-xl ${card.isMatched
                                                    ? 'bg-gradient-to-br from-green-500/30 to-emerald-900/50 border-green-400/60 shadow-green-500/30'
                                                    : 'bg-gradient-to-br from-blue-500/30 to-indigo-900/50 border-blue-400/40 shadow-blue-500/20'
                                                }`}
                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                        >
                                            <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${card.isMatched ? 'text-green-200' : 'text-blue-200'}`} strokeWidth={2} />
                                        </div>
                                    </motion.button>
                                );
                            })}
                            </div>
                        </div>
                    </>
                )}

                {/* Win Modal */}
                <AnimatePresence>
                    {isWon && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none px-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-slate-900/95 border border-white/15 p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl flex flex-col items-center text-center max-w-sm shadow-2xl pointer-events-auto backdrop-blur-2xl"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-lg shadow-amber-500/25 border border-amber-400/20">
                                    <Trophy size={48} className="text-amber-300" strokeWidth={2} />
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Complete!</h2>
                                <p className="text-slate-300 mb-8 sm:mb-10 text-base sm:text-lg">You finished in <span className="text-amber-400 font-bold text-xl">{moves}</span> moves.</p>
                                <button
                                    onClick={startNewGame}
                                    className="w-full py-5 bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:from-amber-300 hover:to-orange-400 rounded-2xl font-bold transition-all shadow-[0_0_40px_rgba(251,191,36,0.25)] text-lg border border-amber-400/20"
                                >
                                    Play Again
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </GameLayout>
    );
}
