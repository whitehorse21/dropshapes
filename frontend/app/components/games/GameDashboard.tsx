'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GAMES = [
    { id: 'breathing', title: 'Breathing Focus', emoji: '🌬️', category: 'stress' as const, path: '/tools/games/breathing' },
    { id: 'memory', title: 'Memory Match', emoji: '🧠', category: 'cognitive' as const, path: '/tools/games/memory' },
    { id: 'scenario', title: 'Scenario Solver', emoji: '🎯', category: 'strategy' as const, path: '/tools/games/scenario' },
    { id: 'reflex', title: 'Reflex Challenge', emoji: '⚡', category: 'cognitive' as const, path: '/tools/games/reflex' },
    { id: 'pattern', title: 'Pattern Logic', emoji: '🕹️', category: 'cognitive' as const, path: '/tools/games/pattern' },
    { id: 'negotiator', title: 'The Negotiator', emoji: '💬', category: 'strategy' as const, path: '/tools/games/negotiator' },
    { id: 'gridrunner', title: 'Grid Runner', emoji: '🏃', category: 'cognitive' as const, path: '/tools/games/gridrunner' },
    { id: 'emotional-investor', title: 'Emotional Investor', emoji: '🧠', category: 'strategy' as const, path: '/tools/games/emotional-investor' },
];

const CATEGORIES: { id: 'all' | 'stress' | 'cognitive' | 'strategy'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'stress', label: 'Stress' },
    { id: 'cognitive', label: 'Brain' },
    { id: 'strategy', label: 'Strategy' },
];

export default function GameDashboard() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'stress' | 'cognitive' | 'strategy'>('all');

    const filteredGames = selectedCategory === 'all'
        ? GAMES
        : GAMES.filter(g => g.category === selectedCategory);

    return (
        <div
            className="games-dashboard min-h-[100dvh] flex flex-col w-full"
            style={{
                background: 'var(--bg)',
                paddingTop: 'max(1.25rem, env(safe-area-inset-top))',
                paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
                paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
                paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
                color: 'var(--text-primary)',
            }}
        >
            <div className="tool-page-wrap flex-1 min-h-0 flex flex-col justify-start w-full">
                <div className="header-minimal">
                    <h1>Mind Hub</h1>
                    <p>Games & mindfulness tools</p>
                </div>
                <div className="tool-page-nav">
                    <button type="button" className="btn-resume" onClick={() => router.push('/')} aria-label="Back to Home">
                        ← Back to Home
                    </button>
                </div>

                {/* Category filter: theme vars (accent when selected) */}
                <div className="flex flex-wrap justify-center gap-2 mb-6 shrink-0">
                    {CATEGORIES.map(({ id, label }) => {
                        const isActive = selectedCategory === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setSelectedCategory(id)}
                                className="control-btn"
                                style={{
                                    width: 'auto',
                                    padding: '0 20px',
                                    borderRadius: '20px',
                                    background: isActive ? 'var(--accent-light)' : 'transparent',
                                    borderColor: isActive ? 'var(--accent)' : 'var(--glass-border)',
                                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Games list: same structure as Quick Tools on home */}
                <div className="tools-section flex-1 min-h-0 w-full flex flex-col">
                    <div className="section-title">Choose a game</div>
                    <div className="grid-minimal home-tools-grid flex-1 min-h-0 content-start">
                        <AnimatePresence mode="popLayout">
                            {filteredGames.map((game) => (
                                <motion.button
                                    key={game.id}
                                    layout
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    type="button"
                                    className="tool-pill"
                                    onClick={() => game.path && router.push(game.path)}
                                    aria-label={`Play ${game.title}`}
                                >
                                    <span aria-hidden>{game.emoji}</span>
                                    <span className="flex-1 min-w-0 text-left font-semibold">{game.title}</span>
                                    <ChevronRight className="w-5 h-5 shrink-0 opacity-60" strokeWidth={2.5} aria-hidden />
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer: theme tertiary text */}
                <footer className="shrink-0 pt-6 pb-2 text-center">
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Progress is saved locally on your device.
                    </p>
                </footer>
            </div>
        </div>
    );
}
