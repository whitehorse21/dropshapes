'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play } from 'lucide-react';
import { GameContainer, GameCard, GameButton, StatBadge, BackButton, GameOverModal } from '@/app/components/GameUI';
import { useRouter } from 'next/navigation';

interface Gate {
    id: number;
    question: string;
    correctAnswer: number;
    y: number;
}

export default function GridRunnerGame() {
    const router = useRouter();
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameOver'>('idle');
    const [playerLane, setPlayerLane] = useState(1);
    const [score, setScore] = useState(0);
    const [gates, setGates] = useState<Gate[]>([]);
    const [speed, setSpeed] = useState(2);
    const gameLoopRef = useRef<number>();
    const gateIdCounter = useRef(0);

    const generateQuestion = () => {
        const operations = ['+', '-', '×'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        let a, b, answer;

        if (op === '+') {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            answer = a + b;
        } else if (op === '-') {
            a = Math.floor(Math.random() * 20) + 10;
            b = Math.floor(Math.random() * (a - 1)) + 1;
            answer = a - b;
        } else {
            a = Math.floor(Math.random() * 10) + 2;
            b = Math.floor(Math.random() * 10) + 2;
            answer = a * b;
        }

        return { question: `${a} ${op} ${b}`, correctAnswer: answer };
    };

    const generateGate = (): Gate => {
        const { question, correctAnswer } = generateQuestion();
        return {
            id: gateIdCounter.current++,
            question,
            correctAnswer,
            y: -100
        };
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setPlayerLane(1);
        setSpeed(2);
        setGates([generateGate()]);
        gateIdCounter.current = 0;
    };

    const getLaneAnswers = (gate: Gate) => {
        const answers = [gate.correctAnswer - 2, gate.correctAnswer, gate.correctAnswer + 3];
        for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
        }
        return answers;
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;
            if (e.key === 'ArrowLeft' && playerLane > 0) setPlayerLane(prev => prev - 1);
            else if (e.key === 'ArrowRight' && playerLane < 2) setPlayerLane(prev => prev + 1);
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, playerLane]);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const gameLoop = () => {
            setGates(prevGates => {
                const newGates = prevGates.map(gate => ({ ...gate, y: gate.y + speed }));
                const playerY = 400;

                newGates.forEach(gate => {
                    if (gate.y >= playerY - 30 && gate.y <= playerY + 30) {
                        const answers = getLaneAnswers(gate);
                        if (answers[playerLane] === gate.correctAnswer) {
                            setScore(prev => prev + 10);
                            setSpeed(prev => Math.min(prev + 0.1, 6));
                        } else {
                            setGameState('gameOver');
                        }
                    }
                });

                const filtered = newGates.filter(gate => gate.y < 500);
                if (filtered.length === 0 || filtered[filtered.length - 1].y > 100) {
                    filtered.push(generateGate());
                }
                return filtered;
            });

            gameLoopRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState, speed, playerLane]);

    return (
        <GameContainer>
            <BackButton onClick={() => router.back()} />

            {gameState === 'idle' && (
                <GameCard title="Grid Runner" icon={<Zap className="w-6 h-6" />}>
                    <div className="text-center space-y-6">
                        <div className="text-6xl mb-4">🏃‍♂️</div>
                        <p className="text-slate-400 text-lg">
                            Solve math problems while running! Use <kbd className="px-2 py-1 bg-slate-800 rounded">←</kbd> and <kbd className="px-2 py-1 bg-slate-800 rounded">→</kbd> arrow keys to pick the right lane.
                        </p>
                        <GameButton variant="primary" onClick={startGame}>
                            <Play className="w-5 h-5" /> Start Game
                        </GameButton>
                    </div>
                </GameCard>
            )}

            {gameState === 'playing' && (
                <>
                    <div className="flex gap-4 mb-6">
                        <StatBadge label="Score" value={score} />
                    </div>

                    <GameCard>
                        <div className="relative w-full h-[500px] bg-slate-950 rounded-xl border-2 border-slate-700 overflow-hidden">
                            <div className="absolute inset-0 flex">
                                {[0, 1, 2].map(lane => (
                                    <div key={lane} className="flex-1 border-r border-slate-800 last:border-r-0" />
                                ))}
                            </div>

                            <div
                                className="absolute bottom-20 w-1/3 h-16 flex items-center justify-center transition-all duration-200"
                                style={{ left: `${playerLane * 33.33}%` }}
                            >
                                <div className="w-12 h-12 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/50 flex items-center justify-center">
                                    <span className="text-2xl">🏃</span>
                                </div>
                            </div>

                            {gates.map(gate => {
                                const answers = getLaneAnswers(gate);
                                return (
                                    <div key={gate.id} className="absolute w-full flex" style={{ top: `${gate.y}px` }}>
                                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-600">
                                            <span className="text-white font-bold text-lg">{gate.question} = ?</span>
                                        </div>
                                        {answers.map((answer, index) => (
                                            <div
                                                key={index}
                                                className={`flex-1 h-16 flex items-center justify-center border-2 ${answer === gate.correctAnswer
                                                        ? 'bg-green-900/30 border-green-500'
                                                        : 'bg-red-900/30 border-red-500'
                                                    }`}
                                            >
                                                <span className="text-2xl font-bold text-white">{answer}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </GameCard>
                </>
            )}

            {gameState === 'gameOver' && (
                <GameOverModal score={score} onRestart={startGame} />
            )}
        </GameContainer>
    );
}
