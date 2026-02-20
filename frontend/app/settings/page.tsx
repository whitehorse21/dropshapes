'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import SettingsView from '@/app/components/views/SettingsView';

export default function SettingsPage() {
    return (
        <AuthWrapper>
            <SettingsView />
        </AuthWrapper>
    );
}
