'use client';

import AuthWrapper from '@/app/components/AuthWrapper';
import BillingView from '@/app/components/views/BillingView';

export default function BillingPage() {
  return (
    <AuthWrapper>
      <BillingView />
    </AuthWrapper>
  );
}
