'use client';

import React, { useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import AuthWrapper from '@/app/components/AuthWrapper';
import SubscriptionView from '@/app/components/views/SubscriptionView';

const stripePublishableKey =
  typeof process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === 'string'
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    : '';

const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

export default function SubscriptionPage() {
  const options = useMemo(() => ({}), []);

  return (
    <AuthWrapper>
      {stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
          <SubscriptionView stripeAvailable />
        </Elements>
      ) : (
        <SubscriptionView stripeAvailable={false} />
      )}
    </AuthWrapper>
  );
}
