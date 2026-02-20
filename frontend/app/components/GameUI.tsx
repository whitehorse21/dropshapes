import React from 'react';
import { ArrowLeft, Trophy, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 1. THE MAIN WRAPPER: Ensures centered content and good background color
export const GameContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#05070A] text-slate-100 flex flex-col items-center p-4 md:p-8 font-sans">
        <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">
            {children}
        </div>
    </div>
);

// 2. THE GAME CARD: The "box" your game lives in
export const GameCard = ({ children, title, icon }: any) => (
    <div className="bg-[#11161F] border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4 z-10 relative">
            <div className="text-blue-400 p-2 bg-blue-500/10 rounded-lg">{icon}</div>
            <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        </div>

        <div className="relative z-10">{children}</div>
    </div>
);

// 3. PRO BUTTONS: No more ugly default grey buttons
export const GameButton = ({ onClick, children, variant = 'primary', disabled }: any) => {
    const base = "w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg";
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50",
        success: "bg-emerald-600 hover:bg-emerald-500 text-white"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant as keyof typeof variants]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );
};

// 4. STAT BADGE: For showing Score, Lives, or Time
export const StatBadge = ({ label, value, icon: Icon }: any) => (
    <div className="flex flex-col items-center bg-[#11161F] p-3 rounded-xl border border-slate-800 min-w-[90px]">
        <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1">{label}</span>
        <div className="flex items-center gap-2 text-lg font-mono font-bold text-white">
            {Icon && <Icon className="w-4 h-4 text-blue-400" />}
            {value}
        </div>
    </div>
);

// 5. BACK BUTTON
export const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
    >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Games</span>
    </button>
);

// 6. GAME OVER MODAL
export const GameOverModal = ({ score, onRestart }: { score?: number; onRestart: () => void }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in">
        <div className="bg-[#11161F] border-2 border-slate-700 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">Game Over!</h2>
            {score !== undefined && (
                <p className="text-slate-400 text-lg mb-8">
                    Final Score: <span className="text-blue-400 font-bold text-2xl">{score}</span>
                </p>
            )}
            <GameButton variant="primary" onClick={onRestart}>
                Play Again
            </GameButton>
        </div>
    </div>
);
