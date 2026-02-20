'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import PatternGame from '@/app/components/games/PatternGame';

export default function PatternGamePage() {
    return (
        <AuthWrapper>
            <PatternGame />
        </AuthWrapper>
    );
}
