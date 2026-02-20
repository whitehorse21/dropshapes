'use client';

import React from 'react';
import AuthWrapper from '@/app/components/AuthWrapper';
import ScenarioGame from '@/app/components/games/ScenarioGame';

export default function ScenarioPage() {
    return (
        <AuthWrapper>
            <div className="home-content-wrapper flex flex-col items-center justify-center h-full">
                <ScenarioGame />
            </div>
        </AuthWrapper>
    );
}
