'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckCircle, X } from 'lucide-react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import type { SubscriptionPlan } from '../types';

interface SubscriptionModalProps {
  planId: number;
  planName: string;
  planPrice: number;
  onClose: () => void;
  onSuccess: () => void;
  onStripeCheckout?: () => void;
  checkoutLoading?: boolean;
  stripePriceId?: string | null;
}

export default function SubscriptionModal({
  planId,
  planName,
  planPrice,
  onClose,
  onSuccess,
  onStripeCheckout,
  checkoutLoading = false,
  stripePriceId,
}: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    planName: string;
    price: number;
    created_at?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubscribe = async () => {
    if (!elements) return;

    setError(null);
    setLoading(true);

    try {
      let paymentMethodId: string | undefined;

      const cardElement = elements.getElement(CardElement);
      if (stripe && cardElement) {
        const { paymentMethod, error: pmError } =
          await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
          });
        if (pmError) {
          setError(pmError.message ?? 'Invalid card');
          setLoading(false);
          return;
        }
        paymentMethodId = paymentMethod?.id;
      }

      const payload: { plan_id: number; payment_method_id?: string } = {
        plan_id: planId,
      };
      if (paymentMethodId) payload.payment_method_id = paymentMethodId;

      const response = await apiService.post(endpoints.subscribeToplan, payload);
      const data = response.data as SubscriptionPlan & { created_at?: string };

      setSuccess({
        planName: data.name || planName,
        price: data.price ?? planPrice,
        created_at: data.created_at,
      });
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof (err.response as { data?: { detail?: string } }).data?.detail === 'string'
          ? (err.response as { data: { detail: string } }).data.detail
          : 'Subscription failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="subscription-modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="subscription-success-title">
        <div className="subscription-success-card">
          <div className="subscription-success-icon" aria-hidden>
            <CheckCircle />
          </div>
          <h2 id="subscription-success-title" className="subscription-success-title">
            Payment Success!
          </h2>
          <p className="subscription-success-price">${success.price}</p>
          <div className="subscription-success-divider" />
          <div className="subscription-success-details">
            <div className="subscription-success-row">
              <span>Plan</span>
              <span>{success.planName}</span>
            </div>
            {success.created_at && (
              <div className="subscription-success-row">
                <span>Date</span>
                <span>
                  {new Date(success.created_at).toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-resume btn-resume-primary subscription-success-btn"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="subscription-modal-title">
      <div className="subscription-modal-card">
        <button
          type="button"
          className="subscription-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="subscription-modal-title" className="subscription-modal-title">
          Subscribe to {planName}
        </h2>
        <p className="subscription-modal-subtitle">
          ${planPrice} — pay securely with your card. Processed by Stripe.
        </p>

        <div className="subscription-modal-card-element-wrap">
          <CardElement
            options={{
              style: {
                base: {
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                  fontFamily: 'var(--font-main), system-ui, sans-serif',
                  '::placeholder': { color: 'var(--text-tertiary)' },
                },
                invalid: { color: 'var(--danger-red)' },
              },
            }}
          />
        </div>

        {error && (
          <p className="subscription-modal-error" role="alert">
            {error}
          </p>
        )}

        {stripePriceId && onStripeCheckout && (
          <p className="subscription-modal-checkout-link">
            <button
              type="button"
              onClick={onStripeCheckout}
              disabled={checkoutLoading || loading}
              className="subscription-modal-checkout-btn"
            >
              {checkoutLoading ? 'Redirecting…' : 'Or continue to Stripe Checkout'}
            </button>
          </p>
        )}
        <div className="subscription-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-resume"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading}
            className="btn-resume btn-resume-primary"
          >
            {loading ? (
              <>
                <span className="subscription-plan-cta-spinner" aria-hidden />
                Pay Now
              </>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
