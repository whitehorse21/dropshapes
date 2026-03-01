'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'missing'>('loading');

  useEffect(() => {
    if (!sessionId) {
      setStatus('missing');
      return;
    }
    setStatus('success');
  }, [sessionId]);

  if (status === 'missing') {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
          <p className="text-[var(--text-secondary)] mb-4">No session found. You may have arrived here without completing checkout.</p>
          <Link href="/subscription" className="btn-resume btn-resume-primary">Back to Subscription</Link>
        </div>
    );
  }

  if (status === 'loading') {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)] mb-4" aria-hidden />
          <p className="text-[var(--text-secondary)]">Confirming your subscription...</p>
        </div>
    );
  }

  return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="subscription-success-card max-w-md w-full text-center">
          <div className="subscription-success-icon mx-auto" aria-hidden>
            <CheckCircle />
          </div>
          <h1 className="subscription-success-title mt-4">Payment successful</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Your subscription is active. You can use your plan benefits right away.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/subscription" className="btn-resume btn-resume-primary">
              View subscription
            </Link>
            <Link href="/" className="btn-resume">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)] mb-4" aria-hidden />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
