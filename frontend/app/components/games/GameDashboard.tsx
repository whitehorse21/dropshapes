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

  const filteredGames =
    selectedCategory === 'all' ? GAMES : GAMES.filter((g) => g.category === selectedCategory);

  return (
    <div className="games-dashboard" role="main" aria-label="Mind Hub games">
      <div className="games-dashboard__inner">
        <header className="games-dashboard__header">
          <h1 className="games-dashboard__title">Mind Hub</h1>
          <p className="games-dashboard__subtitle">Games & mindfulness tools</p>
        </header>

        <nav className="games-dashboard__nav" aria-label="Page actions">
          <button
            type="button"
            className="games-dashboard__back btn-resume"
            onClick={() => router.push('/')}
            aria-label="Back to Home"
          >
            ← Back to Home
          </button>
        </nav>

        <div className="games-dashboard__filters" role="group" aria-label="Filter by category">
          {CATEGORIES.map(({ id, label }) => {
            const isActive = selectedCategory === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedCategory(id)}
                className={`games-dashboard__filter ${isActive ? 'games-dashboard__filter--active' : ''}`}
                aria-pressed={isActive}
                aria-label={`Filter: ${label}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <section className="games-dashboard__section" aria-label="Choose a game">
          <h2 className="games-dashboard__section-title">Choose a game</h2>
          <div className="games-dashboard__grid">
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game) => (
                <motion.button
                  key={game.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  className="games-dashboard__card"
                  onClick={() => game.path && router.push(game.path)}
                  aria-label={`Play ${game.title}`}
                >
                  <span className="games-dashboard__card-emoji" aria-hidden>
                    {game.emoji}
                  </span>
                  <span className="games-dashboard__card-title">{game.title}</span>
                  <ChevronRight className="games-dashboard__card-chevron" strokeWidth={2.5} aria-hidden />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <footer className="games-dashboard__footer">
          <p className="games-dashboard__footer-text">Progress is saved locally on your device.</p>
        </footer>
      </div>
    </div>
  );
}
