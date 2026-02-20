'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import DriveView from '@/app/components/views/DriveView';

export default function DrivePage() {
    return (
        <AuthWrapper>
            <DriveView />
        </AuthWrapper>
    );
}
