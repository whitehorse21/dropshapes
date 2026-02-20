'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import ProfileView from '@/app/components/views/ProfileView';

export default function ProfilePage() {
    return (
        <AuthWrapper>
            <ProfileView />
        </AuthWrapper>
    );
}
