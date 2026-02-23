'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronRight } from 'lucide-react';
import GameLayout from './GameLayout';

interface Option {
    text: string;
    nextScene: string;
}

interface Scene {
    id: string;
    text: string;
    options: Option[];
}

const SCENARIOS: Record<string, Scene> = {
    start: {
        id: 'start',
        text: "You're leading a critical project, and the deadline is in 2 days. Your lead developer just had a family emergency and is out for the week. The client expects a demo on Friday.",
        options: [
            { text: "Push the team to work overtime to cover the gap.", nextScene: 'overtime' },
            { text: "Be transparent with the client and ask for an extension.", nextScene: 'transparency' },
            { text: "Cut non-essential features to meet the deadline.", nextScene: 'scope_cut' }
        ]
    },
    overtime: {
        id: 'overtime',
        text: "The team rallies, but morale drops significantly. You hit the deadline, but the code is buggy and the team is burnt out for the next sprint.",
        options: [
            { text: "Try another scenario", nextScene: 'start' }
        ]
    },
    transparency: {
        id: 'transparency',
        text: "The client is disappointed but appreciates the honesty. They agree to a reduced scope demo on Friday with the full release delayed by 3 days. Your team respects you for protecting them.",
        options: [
            { text: "Try another scenario", nextScene: 'start' }
        ]
    },
    scope_cut: {
        id: 'scope_cut',
        text: "You deliver a stable, albeit smaller, demo. The client is happy with the quality but questions why features are missing. You successfully managed the crisis but need to manage expectations for the next phase.",
        options: [
            { text: "Try another scenario", nextScene: 'start' }
        ]
    }
};

export default function ScenarioGame() {
    const [currentSceneId, setCurrentSceneId] = useState('start');

    const checkScene = (sceneId: string) => {
        setCurrentSceneId(sceneId);
    };

    const currentScene = SCENARIOS[currentSceneId];

    return (
        <GameLayout title="Scenario Solver" subtitle="Strategy">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentSceneId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-2xl"
                >
                    {/* Scenario Card */}
                    <div className="relative overflow-hidden bg-slate-800/50 border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-10 backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" aria-hidden />
                        <div className="flex items-start gap-4 sm:gap-6 relative">
                            <div className="hidden sm:flex w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500/25 to-red-500/25 rounded-2xl md:rounded-3xl items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 border border-orange-400/20">
                                <Target className="w-6 h-6 md:w-8 md:h-8 text-orange-300" strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white leading-relaxed mb-4 sm:mb-6">
                                    {currentScene.text}
                                </h3>
                                <div className="h-1 w-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="grid gap-3 sm:gap-4">
                        {currentScene.options.map((option, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                                onClick={() => checkScene(option.nextScene)}
                                className="group relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-white/10 bg-slate-800/40 hover:bg-slate-800/70 hover:border-orange-500/30 transition-all text-left w-full flex items-center justify-between gap-3 backdrop-blur-sm min-h-[52px]"
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <span className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/15 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:bg-orange-500/20 group-hover:text-orange-300 group-hover:border-orange-400/30 transition-all">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-slate-200 group-hover:text-white transition-colors text-base sm:text-lg font-medium leading-relaxed truncate">
                                        {option.text}
                                    </span>
                                </div>
                                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 group-hover:text-orange-400 transition-all shrink-0" strokeWidth={2.5} />
                            </motion.button>
                        ))}
                    </div>

                </motion.div>
            </AnimatePresence>
        </GameLayout>
    );
}
