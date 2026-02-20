'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import ReflexGame from '@/app/components/games/ReflexGame';

export default function ReflexGamePage() {
    return (
        <AuthWrapper>
            <ReflexGame />
        </AuthWrapper>
    );
}
