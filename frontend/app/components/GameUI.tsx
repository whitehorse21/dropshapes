import React from 'react';
import { ArrowLeft, Trophy, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 1. THE MAIN WRAPPER: Centered content with subtle gradient background
export const GameContainer = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-4 md:p-6 lg:p-8 font-sans safe-area-pad">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)] pointer-events-none" aria-hidden />
        <div className="w-full max-w-2xl relative animate-in fade-in zoom-in duration-500">
            {children}
        </div>
    </div>
);

// 2. THE GAME CARD: Glass-style box with soft glow
export const GameCard = ({ children, title, icon }: any) => (
    <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl overflow-hidden bg-slate-900/80 border border-white/10 backdrop-blur-xl">
        {/* Soft gradient glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/12 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/08 blur-[80px] rounded-full pointer-events-none" />

        {title != null && (
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/10 z-10 relative">
                <div className="text-blue-400 p-2 sm:p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-white/10 shrink-0 shadow-lg shadow-blue-500/10">
                    {icon}
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate drop-shadow-sm">{title}</h2>
            </div>
        )}

        <div className="relative z-10">{children}</div>
    </div>
);

// 3. PRO BUTTONS: Gradient primary, glass secondary/danger/success (touch-friendly)
export const GameButton = ({ onClick, children, variant = 'primary', disabled }: any) => {
    const base = "w-full min-h-[48px] sm:min-h-[52px] py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl";
    const variants = {
        primary: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-blue-500/25 border border-blue-400/20",
        secondary: "bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-600/80 hover:border-slate-500",
        danger: "bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 hover:border-red-400/50",
        success: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25 border border-emerald-400/20"
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

// 4. STAT BADGE: Glass pill for Score, Lives, Time
export const StatBadge = ({ label, value, icon: Icon }: any) => (
    <div className="flex flex-col items-center bg-slate-800/60 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border border-white/10 min-w-[72px] sm:min-w-[90px] shadow-lg">
        <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold mb-0.5 sm:mb-1">{label}</span>
        <div className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-mono font-bold text-white">
            {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />}
            {value}
        </div>
    </div>
);

// 5. BACK BUTTON (touch-friendly, pill style)
export const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="mb-4 sm:mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-200 group min-h-[44px] pl-3 pr-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 backdrop-blur-sm"
        type="button"
    >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform shrink-0" />
        <span className="font-medium text-sm sm:text-base">Back to Games</span>
    </button>
);

// 6. GAME OVER MODAL (centered, glass style, responsive)
export const GameOverModal = ({ score, onRestart }: { score?: number; onRestart: () => void }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in">
        <div className="bg-slate-900/95 border border-white/15 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 max-w-md w-full text-center shadow-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(0,0,0,0.4)]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500/30 to-yellow-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shrink-0 border border-amber-400/20 shadow-lg shadow-amber-500/20">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white drop-shadow-sm">Game Over!</h2>
            {score !== undefined && (
                <p className="text-slate-300 text-base sm:text-lg mb-6 sm:mb-8">
                    Final Score: <span className="text-amber-400 font-bold text-xl sm:text-2xl">{score}</span>
                </p>
            )}
            <GameButton variant="primary" onClick={onRestart}>
                Play Again
            </GameButton>
        </div>
    </div>
);
