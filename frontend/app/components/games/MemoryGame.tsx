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
            <div className="flex flex-col items-center w-full max-w-lg">

                {!gameStarted && !isWon ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-10 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/10">
                            <RefreshCw size={48} className="text-purple-300" strokeWidth={2} />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to Train?</h2>
                        <p className="text-white/60 mb-10 max-w-xs mx-auto leading-relaxed text-base">
                            Find all <span className="text-white/90 font-semibold">8 matching pairs</span>. Memorize positions and clear the board in as few moves as possible.
                        </p>
                        <button
                            onClick={startNewGame}
                            className="w-full py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-[1.02] active:scale-[0.98] rounded-3xl font-bold transition-all shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.4)] text-lg flex items-center justify-center gap-3"
                        >
                            <Play size={22} fill="currentColor" /> Start Game
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* Stats Bar */}
                        <div className="flex items-center justify-between w-full mb-8 px-2">
                            <div className="text-white/70 font-semibold text-lg">
                                Moves: <span className="text-white font-bold ml-2 text-xl">{moves}</span>
                            </div>
                            <button
                                onClick={startNewGame}
                                className="p-3 rounded-2xl hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10 hover:border-white/20 backdrop-blur-xl"
                                title="Restart"
                            >
                                <RefreshCw size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-4 gap-4 w-full aspect-square">
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
                                            className={`absolute inset-0 w-full h-full rounded-3xl flex items-center justify-center backface-hidden border-2 shadow-2xl backdrop-blur-xl ${card.isMatched
                                                    ? 'bg-gradient-to-br from-green-500/30 to-emerald-900/50 border-green-400/60 shadow-green-500/30'
                                                    : 'bg-gradient-to-br from-blue-500/30 to-indigo-900/50 border-blue-400/40 shadow-blue-500/20'
                                                }`}
                                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                        >
                                            <Icon size={32} className={card.isMatched ? 'text-green-200' : 'text-blue-200'} strokeWidth={2} />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Win Modal */}
                <AnimatePresence>
                    {isWon && (
                        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none px-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-[#0A0C10]/95 border-2 border-white/20 p-10 rounded-[40px] flex flex-col items-center text-center max-w-sm shadow-2xl pointer-events-auto backdrop-blur-2xl"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-yellow-400/20">
                                    <Trophy size={48} className="text-yellow-300" strokeWidth={2} />
                                </div>
                                <h2 className="text-4xl font-bold mb-4 text-white">Complete!</h2>
                                <p className="text-white/60 mb-10 text-lg">You finished in <span className="text-white font-bold text-xl">{moves}</span> moves.</p>
                                <button
                                    onClick={startNewGame}
                                    className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-[1.02] active:scale-[0.98] rounded-3xl font-bold transition-all shadow-[0_0_40px_rgba(251,191,36,0.3)] text-lg"
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
