'use client';

import React, { useState } from 'react';
import { Battery, Heart, Zap, Brain, AlertTriangle, Trophy, Play, RotateCcw } from 'lucide-react';
import { GameContainer, GameCard, GameButton, StatBadge, BackButton } from '@/app/components/GameUI';
import { useRouter } from 'next/navigation';

interface Choice {
    text: string;
    energyCost: number;
    socialCost: number;
    patienceCost: number;
}

interface Scenario {
    situation: string;
    choices: Choice[];
}

const SCENARIOS: Scenario[] = [
    {
        situation: "Your boss sends an urgent email at 8 PM asking for a report by tomorrow morning.",
        choices: [
            { text: "Reply immediately and work late", energyCost: -15, socialCost: -10, patienceCost: 5 },
            { text: "Ignore until morning", energyCost: 5, socialCost: 0, patienceCost: -10 },
            { text: "Set boundaries: 'I'll have it by noon tomorrow'", energyCost: -5, socialCost: 5, patienceCost: 10 }
        ]
    },
    {
        situation: "A friend calls to vent about their relationship problems for the third time this week.",
        choices: [
            { text: "Listen patiently for an hour", energyCost: -10, socialCost: -20, patienceCost: -15 },
            { text: "Politely say you're busy", energyCost: 0, socialCost: 10, patienceCost: 5 },
            { text: "Listen for 15 minutes, then suggest they talk to a therapist", energyCost: -5, socialCost: -5, patienceCost: 0 }
        ]
    },
    {
        situation: "You're invited to a networking event, but you've been socializing all week and feel drained.",
        choices: [
            { text: "Force yourself to go", energyCost: -20, socialCost: -25, patienceCost: -10 },
            { text: "Skip it and rest at home", energyCost: 15, socialCost: 20, patienceCost: 10 },
            { text: "Go for 30 minutes, then leave early", energyCost: -10, socialCost: -10, patienceCost: 0 }
        ]
    },
    {
        situation: "Your gym buddy wants to work out, but you're exhausted from a long day.",
        choices: [
            { text: "Push through and go to the gym", energyCost: -15, socialCost: -5, patienceCost: 10 },
            { text: "Cancel and feel guilty", energyCost: 5, socialCost: 5, patienceCost: -15 },
            { text: "Suggest a light walk instead", energyCost: -5, socialCost: 0, patienceCost: 5 }
        ]
    },
    {
        situation: "A family member asks you to help them move this weekend, your only free time.",
        choices: [
            { text: "Say yes immediately", energyCost: -25, socialCost: -15, patienceCost: -20 },
            { text: "Make an excuse to avoid it", energyCost: 0, socialCost: 10, patienceCost: -10 },
            { text: "Offer to help for 2 hours, not the whole day", energyCost: -10, socialCost: -5, patienceCost: 0 }
        ]
    }
];

export default function EmotionalInvestorGame() {
    const router = useRouter();
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
    const [currentScenario, setCurrentScenario] = useState(0);
    const [energy, setEnergy] = useState(100);
    const [socialBattery, setSocialBattery] = useState(100);
    const [patience, setPatience] = useState(100);

    const startGame = () => {
        setGameState('playing');
        setCurrentScenario(0);
        setEnergy(100);
        setSocialBattery(100);
        setPatience(100);
    };

    const handleChoice = (choice: Choice) => {
        const newEnergy = Math.max(0, Math.min(100, energy + choice.energyCost));
        const newSocial = Math.max(0, Math.min(100, socialBattery + choice.socialCost));
        const newPatience = Math.max(0, Math.min(100, patience + choice.patienceCost));

        setEnergy(newEnergy);
        setSocialBattery(newSocial);
        setPatience(newPatience);

        // Check for burnout
        if (newEnergy === 0 || newSocial === 0 || newPatience === 0) {
            setGameState('lost');
            return;
        }

        // Check for win
        if (currentScenario === SCENARIOS.length - 1) {
            setGameState('won');
            return;
        }

        // Move to next scenario
        setCurrentScenario(currentScenario + 1);
    };

    const getStatColor = (value: number) => {
        if (value >= 70) return 'text-green-400';
        if (value >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <GameContainer>
            <BackButton onClick={() => router.back()} />

            {gameState === 'idle' && (
                <GameCard title="The Emotional Investor" icon={<Brain className="w-6 h-6" />}>
                    <div className="text-center space-y-6">
                        <div className="text-6xl mb-4">🧠</div>
                        <h3 className="text-2xl font-bold text-white">Manage Your Mental Resources</h3>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Navigate 5 daily scenarios while balancing your <span className="text-green-400 font-semibold">Energy</span>, <span className="text-blue-400 font-semibold">Social Battery</span>, and <span className="text-yellow-400 font-semibold">Patience</span>.
                        </p>
                        <p className="text-slate-500 text-sm">
                            If any resource hits 0, you experience burnout. Make strategic choices to survive the week!
                        </p>
                        <GameButton variant="primary" onClick={startGame}>
                            <Play className="w-5 h-5" /> Start Game
                        </GameButton>
                    </div>
                </GameCard>
            )}

            {gameState === 'playing' && (
                <>
                    {/* Stats Display */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <StatBadge label="Energy" value={`${energy}%`} icon={Zap} />
                        <StatBadge label="Social" value={`${socialBattery}%`} icon={Heart} />
                        <StatBadge label="Patience" value={`${patience}%`} icon={Battery} />
                    </div>

                    {/* Progress */}
                    <div className="mb-6 text-center">
                        <span className="text-slate-500 text-sm">Scenario {currentScenario + 1} of {SCENARIOS.length}</span>
                    </div>

                    {/* Scenario Card */}
                    <GameCard title={`Day ${currentScenario + 1}`} icon={<AlertTriangle className="w-6 h-6" />}>
                        <p className="text-slate-300 text-lg leading-relaxed mb-8">
                            {SCENARIOS[currentScenario].situation}
                        </p>

                        <div className="space-y-3">
                            {SCENARIOS[currentScenario].choices.map((choice, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleChoice(choice)}
                                    className="w-full text-left p-5 rounded-xl border-2 border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm bg-slate-700 text-slate-200">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-lg text-slate-200 group-hover:text-slate-50 mb-2">{choice.text}</p>
                                            <div className="flex gap-4 text-xs">
                                                <span className={choice.energyCost > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    Energy: {choice.energyCost > 0 ? '+' : ''}{choice.energyCost}
                                                </span>
                                                <span className={choice.socialCost > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    Social: {choice.socialCost > 0 ? '+' : ''}{choice.socialCost}
                                                </span>
                                                <span className={choice.patienceCost > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    Patience: {choice.patienceCost > 0 ? '+' : ''}{choice.patienceCost}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </GameCard>
                </>
            )}

            {gameState === 'won' && (
                <GameCard title="Victory!" icon={<Trophy className="w-6 h-6" />}>
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Trophy className="w-12 h-12 text-green-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">You Survived the Week!</h3>
                        <p className="text-slate-400 text-lg">
                            You successfully balanced your mental resources and avoided burnout.
                        </p>
                        <div className="grid grid-cols-3 gap-3 my-6">
                            <div className="bg-slate-800/50 p-4 rounded-xl">
                                <div className={`text-2xl font-bold ${getStatColor(energy)}`}>{energy}%</div>
                                <div className="text-slate-500 text-sm">Energy</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl">
                                <div className={`text-2xl font-bold ${getStatColor(socialBattery)}`}>{socialBattery}%</div>
                                <div className="text-slate-500 text-sm">Social</div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl">
                                <div className={`text-2xl font-bold ${getStatColor(patience)}`}>{patience}%</div>
                                <div className="text-slate-500 text-sm">Patience</div>
                            </div>
                        </div>
                        <GameButton variant="success" onClick={startGame}>
                            <RotateCcw className="w-5 h-5" /> Play Again
                        </GameButton>
                    </div>
                </GameCard>
            )}

            {gameState === 'lost' && (
                <GameCard title="Burnout!" icon={<AlertTriangle className="w-6 h-6" />}>
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-12 h-12 text-red-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">You Experienced Burnout</h3>
                        <p className="text-slate-400 text-lg">
                            One of your resources hit zero. Remember: your mental health is a budget that must be managed carefully.
                        </p>
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-red-300 text-sm">
                            {energy === 0 && "Your energy reserves were completely depleted."}
                            {socialBattery === 0 && "Your social battery ran out completely."}
                            {patience === 0 && "You ran out of patience."}
                        </div>
                        <GameButton variant="danger" onClick={startGame}>
                            <RotateCcw className="w-5 h-5" /> Try Again
                        </GameButton>
                    </div>
                </GameCard>
            )}
        </GameContainer>
    );
}
