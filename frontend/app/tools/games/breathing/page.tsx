'use client';

import React from 'react';
import AuthWrapper from '@/app/components/AuthWrapper';
import BreathingTool from '@/app/components/games/BreathingTool';

export default function BreathingPage() {
    return (
        <AuthWrapper>
            <div className="home-content-wrapper flex flex-col items-center justify-center h-full">
                <BreathingTool />
            </div>
        </AuthWrapper>
    );
}
