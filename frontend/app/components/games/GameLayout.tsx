'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameLayoutProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    instructions?: string;
}

export default function GameLayout({ title, icon, children, instructions }: GameLayoutProps) {
    const router = useRouter();

    return (
        // 1. GLOBAL THEME: Deep soothing dark blue background (Good for eyes)
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

            {/* 2. HEADER: Navigation and Title */}
            <header className="p-6 flex items-center gap-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="text-blue-400">{icon}</div>
                    <h1 className="text-xl font-bold tracking-wide">{title}</h1>
                </div>
            </header>

            {/* 3. GAME AREA: Centered, constrained width, proper spacing */}
            <main className="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
                <div className="w-full max-w-3xl space-y-6">

                    {/* Optional Instructions Box */}
                    {instructions && (
                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-blue-200 text-sm">
                            <span className="font-bold uppercase tracking-wider text-xs block mb-1 text-blue-400">Mission</span>
                            {instructions}
                        </div>
                    )}

                    {/* THE GAME CONTENT GOES HERE */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
                        {children}
                    </div>

                </div>
            </main>
        </div>
    );
}
