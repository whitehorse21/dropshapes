'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUI } from '../context/UIContext';

export default function Dock() {
    const pathname = usePathname();
    const router = useRouter();
    const { toggleSidebar } = useUI();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="dock" id="mainDock" aria-label="Main navigation">
            <button
                type="button"
                className={`dock-item ${isActive('/') ? 'active' : ''}`}
                onClick={() => router.push('/')}
                aria-label="Home"
                data-target="home"
            >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span className="dock-tooltip">Home</span>
            </button>
            <button
                type="button"
                className="dock-item"
                onClick={toggleSidebar}
                aria-label="History"
                data-target="history"
            >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="dock-tooltip">History</span>
            </button>
            <button
                type="button"
                className={`dock-item ${isActive('/drive') ? 'active' : ''}`}
                onClick={() => router.push('/drive')}
                aria-label="Drive"
                data-target="drive"
            >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="dock-tooltip">Drive</span>
            </button>
            <button
                type="button"
                className={`dock-item ${isActive('/analytics') ? 'active' : ''}`}
                onClick={() => router.push('/analytics')}
                aria-label="Analytics"
                data-target="analytics"
            >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="dock-tooltip">Analytics</span>
            </button>
            <button
                type="button"
                className={`dock-item ${isActive('/settings') ? 'active' : ''}`}
                onClick={() => router.push('/settings')}
                aria-label="Settings"
                data-target="settings"
            >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                <span className="dock-tooltip">Settings</span>
            </button>
        </nav>
    );
}
