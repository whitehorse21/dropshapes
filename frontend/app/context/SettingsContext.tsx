'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Settings {
    theme: 'dark' | 'light';
    notif: boolean;
    sound: boolean;
    clear: boolean;
    spell: boolean;
    zen: boolean;
    motion: boolean;
    dysFont: boolean;
    dysSpacing: boolean;
    dysLarge: boolean;
    dysLeft: boolean;
    dysTint: boolean;
    lowStim: boolean;
    forceFocus: boolean;
    bigTargets: boolean;
    noItalics: boolean;
}

const defaultSettings: Settings = {
    theme: 'dark',
    notif: true,
    sound: true,
    clear: true,
    spell: false,
    zen: false,
    motion: false,
    dysFont: false,
    dysSpacing: false,
    dysLarge: false,
    dysLeft: false,
    dysTint: false,
    lowStim: false,
    forceFocus: false,
    bigTargets: false,
    noItalics: false,
};

interface SettingsContextType {
    settings: Settings;
    toggleSetting: (key: keyof Settings) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('dropshapes_settings');
        if (saved) {
            try {
                // Ensure we don't load 'contrast' if it exists in old storage
                const parsed = JSON.parse(saved);
                delete parsed.contrast;
                setSettings({ ...defaultSettings, ...parsed });
            } catch (e) {
                console.error('Failed to parse settings', e);
            }
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem('dropshapes_settings', JSON.stringify(settings));

        // Apply body classes
        const body = document.body;
        body.classList.toggle('light-mode', settings.theme === 'light');
        // High contrast removed
        body.classList.toggle('zen-mode', settings.zen);
        body.classList.toggle('reduce-motion', settings.motion);
        body.classList.toggle('low-stim-mode', settings.lowStim);
        body.classList.toggle('force-focus-mode', settings.forceFocus);
        body.classList.toggle('big-targets-mode', settings.bigTargets);
        body.classList.toggle('no-italics-mode', settings.noItalics);
        body.classList.toggle('dyslexia-font-mode', settings.dysFont);
        body.classList.toggle('dyslexia-spacing-mode', settings.dysSpacing);
        body.classList.toggle('dyslexia-large-mode', settings.dysLarge);
        body.classList.toggle('dyslexia-leftalign-mode', settings.dysLeft);
        body.classList.toggle('dyslexia-tint-mode', settings.dysTint);

    }, [settings, mounted]);

    const toggleSetting = (key: keyof Settings) => {
        setSettings(prev => {
            if (key === 'theme') {
                return { ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' };
            }
            return { ...prev, [key]: !prev[key] };
        });
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    // Prevent flash of incorrect theme
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <SettingsContext.Provider value={{ settings, toggleSetting, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
