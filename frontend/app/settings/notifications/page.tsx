'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import NotificationsView from '@/app/components/views/NotificationsView';

export default function NotificationsPage() {
  return (
    <AuthWrapper>
      <NotificationsView />
    </AuthWrapper>
  );
}
