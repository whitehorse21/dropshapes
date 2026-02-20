'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GameDashboard() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'stress' | 'cognitive' | 'strategy'>('all');

    const games = [
        {
            id: 'breathing',
            title: 'Breathing Focus',
            emoji: '🌬️',
            category: 'stress',
            path: '/tools/games/breathing'
        },
        {
            id: 'memory',
            title: 'Memory Match',
            emoji: '🧠',
            category: 'cognitive',
            path: '/tools/games/memory'
        },
        {
            id: 'scenario',
            title: 'Scenario Solver',
            emoji: '🎯',
            category: 'strategy',
            path: '/tools/games/scenario'
        },
        {
            id: 'reflex',
            title: 'Reflex Challenge',
            emoji: '⚡',
            category: 'cognitive',
            path: '/tools/games/reflex'
        },
        {
            id: 'pattern',
            title: 'Pattern Logic',
            emoji: '🕹️',
            category: 'cognitive',
            path: '/tools/games/pattern'
        },
        {
            id: 'negotiator',
            title: 'The Negotiator',
            emoji: '💬',
            category: 'strategy',
            path: '/tools/games/negotiator'
        },
        {
            id: 'gridrunner',
            title: 'Grid Runner',
            emoji: '🏃',
            category: 'cognitive',
            path: '/tools/games/gridrunner'
        },
        {
            id: 'emotional-investor',
            title: 'Emotional Investor',
            emoji: '🧠',
            category: 'strategy',
            path: '/tools/games/emotional-investor'
        }
    ];

    const filteredGames = selectedCategory === 'all'
        ? games
        : games.filter(g => g.category === selectedCategory);

    return (
        <div className="home-content-wrapper transition-all duration-500">
            {/* Minimal Header matching Home */}
            <div className="header-minimal">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                    <button
                        onClick={() => router.push('/')}
                        className="control-btn"
                        aria-label="Back to Home"
                        title="Back to Home"
                        style={{ margin: 0 }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ margin: 0 }}>Mind Hub.</h1>
                </div>
                <p>Sharpen your mind and reduce stress.</p>
            </div>

            {/* Category Filter */}
            <div className="chat-controls" style={{ marginBottom: '32px' }}>
                <button
                    className={`control-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                    style={{ width: 'auto', padding: '0 20px', borderRadius: '20px' }}
                >
                    All
                </button>
                <button
                    className={`control-btn ${selectedCategory === 'stress' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('stress')}
                    style={{ width: 'auto', padding: '0 20px', borderRadius: '20px' }}
                >
                    Stress
                </button>
                <button
                    className={`control-btn ${selectedCategory === 'cognitive' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('cognitive')}
                    style={{ width: 'auto', padding: '0 20px', borderRadius: '20px' }}
                >
                    Brain
                </button>
                <button
                    className={`control-btn ${selectedCategory === 'strategy' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('strategy')}
                    style={{ width: 'auto', padding: '0 20px', borderRadius: '20px' }}
                >
                    Strategy
                </button>
            </div>

            {/* Tools Section */}
            <div className="tools-section">
                <div className="grid-minimal">
                    <AnimatePresence mode="popLayout">
                        {filteredGames.map((game) => (
                            <motion.button
                                key={game.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                type="button"
                                className="tool-pill"
                                onClick={() => {
                                    if (game.path) {
                                        router.push(game.path);
                                    }
                                }}
                                aria-label={game.title}
                            >
                                <span>{game.emoji}</span> {game.title}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="privacy-shield" aria-label="Privacy status" style={{ marginTop: 'auto' }}>
                <div className="pulse-dot"></div>
                <span>Syncing progress...</span>
            </div>
        </div>
    );
}
