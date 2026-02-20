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
                    <div className="relative overflow-hidden bg-white/5 border-2 border-white/10 p-10 rounded-[40px] shadow-2xl mb-10 backdrop-blur-xl">
                        <div className="flex items-start gap-8">
                            <div className="hidden md:flex w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/10">
                                <Target size={32} className="text-orange-300" strokeWidth={2} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl md:text-3xl font-semibold text-white leading-relaxed mb-6">
                                    {currentScene.text}
                                </h3>
                                <div className="h-1.5 w-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-lg shadow-orange-500/30" />
                            </div>
                        </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid gap-4">
                        {currentScene.options.map((option, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => checkScene(option.nextScene)}
                                className="group relative overflow-hidden p-6 rounded-3xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 hover:scale-[1.01] transition-all text-left w-full flex items-center justify-between backdrop-blur-xl shadow-lg"
                            >
                                <div className="flex items-center gap-6">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-2xl border-2 border-white/20 flex items-center justify-center text-base font-bold text-white/60 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-500 group-hover:text-white group-hover:border-transparent transition-all shadow-lg">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-white/70 group-hover:text-white transition-colors text-lg font-medium leading-relaxed">
                                        {option.text}
                                    </span>
                                </div>
                                <ChevronRight size={24} className="text-white/30 group-hover:text-white transition-all opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0" strokeWidth={2.5} />
                            </motion.button>
                        ))}
                    </div>

                </motion.div>
            </AnimatePresence>
        </GameLayout>
    );
}
