'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import AnalyticsView from '@/app/components/views/AnalyticsView';

export default function AnalyticsPage() {
    return (
        <AuthWrapper>
            <AnalyticsView />
        </AuthWrapper>
    );
}
