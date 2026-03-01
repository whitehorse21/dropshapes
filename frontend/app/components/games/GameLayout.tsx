'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameLayoutProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    instructions?: string;
}

export default function GameLayout({ title, subtitle, icon, children, instructions }: GameLayoutProps) {
    const router = useRouter();

    return (
        <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950 text-slate-100 flex flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(59,130,246,0.06),transparent)] pointer-events-none" aria-hidden />

            {/* Header: safe-area top + comfortable padding, back + title */}
            <header
                className="relative flex items-center gap-3 sm:gap-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50 shrink-0"
                style={{
                    paddingTop: 'max(1rem, env(safe-area-inset-top))',
                    paddingBottom: '1rem',
                    paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                    paddingRight: 'max(1rem, env(safe-area-inset-right))'
                }}
            >
                <button
                    onClick={() => router.back()}
                    className="p-2.5 hover:bg-white/10 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white"
                    type="button"
                    aria-label="Back"
                >
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {icon != null && (
                        <div className="text-blue-400 p-1.5 bg-blue-500/10 rounded-lg border border-white/5 shrink-0">{icon}</div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight truncate text-white">{title}</h1>
                        {subtitle != null && subtitle !== '' && (
                            <p className="text-xs sm:text-sm text-slate-400 truncate">{subtitle}</p>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative flex-1 flex flex-col items-center p-4 sm:p-5 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-h-0">
                <div className="w-full max-w-3xl space-y-4 sm:space-y-6">

                    {instructions && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-3 sm:p-4 rounded-xl text-blue-200/90 text-xs sm:text-sm backdrop-blur-sm">
                            <span className="font-bold uppercase tracking-wider text-xs block mb-1 text-blue-400">Mission</span>
                            {instructions}
                        </div>
                    )}

                    <div className="bg-slate-900/80 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl backdrop-blur-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/8 blur-[80px] rounded-full pointer-events-none" aria-hidden />
                        <div className="relative z-10">{children}</div>
                    </div>

                </div>
            </main>
        </div>
    );
}
