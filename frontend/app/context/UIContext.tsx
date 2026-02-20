'use client';

import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(prev => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <UIContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}
