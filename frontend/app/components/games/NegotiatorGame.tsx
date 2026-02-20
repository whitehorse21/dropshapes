'use client';

import React, { useState } from 'react';
import { MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { GameContainer, GameCard, GameButton, StatBadge, BackButton } from '@/app/components/GameUI';
import { useRouter } from 'next/navigation';

interface DialogueOption {
    text: string;
    trustChange: number;
    nextScene: string;
    type: 'aggressive' | 'neutral' | 'empathetic';
}

interface Scene {
    id: string;
    situation: string;
    options: DialogueOption[];
    isEnding?: boolean;
}

const SCENARIOS: Record<string, Scene> = {
    start: {
        id: 'start',
        situation: "You're in your manager's office for your annual review. You've been working hard and want a raise, but the company has been cutting costs. Your manager says: 'We appreciate your work, but budgets are tight this year.'",
        options: [
            { text: "I understand, but I've exceeded all my targets. I deserve this.", trustChange: -10, nextScene: 'aggressive_response', type: 'aggressive' },
            { text: "I see. Can we discuss what metrics would justify a raise in the future?", trustChange: 15, nextScene: 'empathetic_response', type: 'empathetic' },
            { text: "Okay, I'll wait until next year then.", trustChange: 0, nextScene: 'neutral_ending', type: 'neutral' }
        ]
    },
    aggressive_response: {
        id: 'aggressive_response',
        situation: "Your manager looks uncomfortable. 'I understand you're frustrated, but we need to be realistic about the company's situation.' The tension in the room is rising.",
        options: [
            { text: "Then maybe I should look elsewhere for opportunities.", trustChange: -20, nextScene: 'bad_ending', type: 'aggressive' },
            { text: "You're right, I apologize. Let's discuss this constructively.", trustChange: 10, nextScene: 'recovery_path', type: 'empathetic' }
        ]
    },
    empathetic_response: {
        id: 'empathetic_response',
        situation: "Your manager relaxes and leans forward. 'That's a great question. Let me be honest - if you can lead the Q3 project successfully, I'll personally advocate for a 15% raise.'",
        options: [
            { text: "That sounds fair. I'm ready to take on that challenge.", trustChange: 20, nextScene: 'good_ending', type: 'empathetic' },
            { text: "Only 15%? I was hoping for at least 20%.", trustChange: -5, nextScene: 'negotiation_push', type: 'aggressive' }
        ]
    },
    recovery_path: {
        id: 'recovery_path',
        situation: "Your manager appreciates the shift in tone. 'I respect that. How about we set up quarterly check-ins to track your progress toward a raise?'",
        options: [
            { text: "That works for me. Thank you for being understanding.", trustChange: 15, nextScene: 'neutral_good_ending', type: 'empathetic' }
        ]
    },
    negotiation_push: {
        id: 'negotiation_push',
        situation: "Your manager pauses. 'I can try for 18%, but that's the absolute maximum I can promise. Deal?'",
        options: [
            { text: "Deal. I appreciate you going to bat for me.", trustChange: 10, nextScene: 'good_ending', type: 'empathetic' },
            { text: "I'll take the 15% for now.", trustChange: 5, nextScene: 'good_ending', type: 'neutral' }
        ]
    },
    bad_ending: {
        id: 'bad_ending',
        situation: "Your manager's expression hardens. 'I'm sorry you feel that way.' The conversation ends awkwardly. You leave with no raise and damaged trust.",
        options: [],
        isEnding: true
    },
    neutral_ending: {
        id: 'neutral_ending',
        situation: "Your manager nods. 'I appreciate your patience. Let's revisit this in 6 months.' You maintained the relationship but didn't advocate for yourself.",
        options: [],
        isEnding: true
    },
    neutral_good_ending: {
        id: 'neutral_good_ending',
        situation: "You've successfully de-escalated and created a path forward. While you didn't get an immediate raise, you've built trust and have a clear roadmap.",
        options: [],
        isEnding: true
    },
    good_ending: {
        id: 'good_ending',
        situation: "Your manager smiles and shakes your hand. 'You handled this professionally. I'll start the paperwork.' You've successfully negotiated a raise while maintaining trust!",
        options: [],
        isEnding: true
    }
};

export default function NegotiatorGame() {
    const router = useRouter();
    const [currentScene, setCurrentScene] = useState('start');
    const [trustScore, setTrustScore] = useState(50);

    const scene = SCENARIOS[currentScene];

    const handleChoice = (option: DialogueOption) => {
        setTrustScore(prev => Math.max(0, Math.min(100, prev + option.trustChange)));
        setCurrentScene(option.nextScene);
    };

    const resetGame = () => {
        setCurrentScene('start');
        setTrustScore(50);
    };

    const getTrustColor = () => {
        if (trustScore >= 70) return 'text-green-400';
        if (trustScore >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <GameContainer>
            <BackButton onClick={() => router.back()} />

            <div className="flex gap-4 mb-6">
                <StatBadge
                    label="Trust"
                    value={trustScore}
                    icon={trustScore > 50 ? TrendingUp : TrendingDown}
                />
            </div>

            <GameCard title="The Negotiator" icon={<MessageCircle className="w-6 h-6" />}>

                {/* Situation Text */}
                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                    {scene.situation}
                </p>

                {/* Dialogue Options or Ending */}
                {scene.isEnding ? (
                    <div className="space-y-4">
                        <div className={`p-6 rounded-xl border-2 ${trustScore >= 70 ? 'bg-green-900/20 border-green-500/50' :
                                trustScore >= 40 ? 'bg-yellow-900/20 border-yellow-500/50' :
                                    'bg-red-900/20 border-red-500/50'
                            }`}>
                            <h3 className="text-xl font-bold mb-2 text-white">
                                {trustScore >= 70 ? '✅ Success!' : trustScore >= 40 ? '⚖️ Mixed Result' : '❌ Poor Outcome'}
                            </h3>
                            <p className="text-slate-300">Final Trust Score: <span className={`font-bold ${getTrustColor()}`}>{trustScore}</span></p>
                        </div>
                        <GameButton variant="primary" onClick={resetGame}>
                            Try Again
                        </GameButton>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scene.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleChoice(option)}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group hover:scale-[1.02] ${option.type === 'aggressive' ? 'bg-red-900/10 border-red-800/50 hover:bg-red-900/20 hover:border-red-600' :
                                        option.type === 'empathetic' ? 'bg-green-900/10 border-green-800/50 hover:bg-green-900/20 hover:border-green-600' :
                                            'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${option.type === 'aggressive' ? 'bg-red-800 text-red-100' :
                                            option.type === 'empathetic' ? 'bg-green-800 text-green-100' :
                                                'bg-slate-700 text-slate-200'
                                        }`}>
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="text-lg text-slate-200 group-hover:text-slate-50">{option.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </GameCard>
        </GameContainer>
    );
}
