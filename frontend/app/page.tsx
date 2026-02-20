'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import HomeView from '@/app/components/views/HomeView';

export default function Home() {
  return (
    <AuthWrapper>
      <HomeView />
    </AuthWrapper>
  );
}
