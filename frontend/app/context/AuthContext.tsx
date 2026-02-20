'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface AuthContextType {
    user: string | null;
    isLoading: boolean;
    login: (username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<string | null>(null);

    // Sync NextAuth session with our local user state
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setUser(session.user.name || session.user.email || 'User');
        } else if (status === 'loading') {
            // do nothing
        } else {
            // Fallback to local storage mock if not logged in via provider
            // This preserves the "guest" / simple login flow we had before
            const savedUser = localStorage.getItem('dropshapes_user');
            if (savedUser) setUser(savedUser);
        }
    }, [session, status]);

    const login = (name: string) => {
        setUser(name);
        localStorage.setItem('dropshapes_user', name);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('dropshapes_user');
        signOut({ redirect: false });
    };

    const isLoading = status === 'loading';

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
