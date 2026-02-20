'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfileWidget() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    return (
        <button
            type="button"
            className="profile-widget"
            id="topProfileWidget"
            onClick={() => router.push('/profile')}
            aria-label="Open profile"
        >
            <span id="widgetInitials">{user.charAt(0).toUpperCase()}</span>
        </button>
    );
}
