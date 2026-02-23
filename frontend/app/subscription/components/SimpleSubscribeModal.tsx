'use client';

import React, { useState } from 'react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import { CheckCircle, X } from 'lucide-react';

interface SimpleSubscribeModalProps {
  planId: number;
  planName: string;
  planPrice: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SimpleSubscribeModal({
  planId,
  planName,
  planPrice,
  onClose,
  onSuccess,
}: SimpleSubscribeModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setError(null);
    setLoading(true);
    try {
      await apiService.post(endpoints.subscribeToplan, { plan_id: planId });
      setSuccess(true);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err.response as { data?: { detail?: string } })?.data?.detail;
      setError(typeof msg === 'string' ? msg : 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="subscription-modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="simple-success-title">
        <div className="subscription-success-card">
          <div className="subscription-success-icon" aria-hidden>
            <CheckCircle />
          </div>
          <h2 id="simple-success-title" className="subscription-success-title">
            Subscribed!
          </h2>
          <p className="subscription-success-price">{planName} — ${planPrice}</p>
          <button type="button" onClick={onClose} className="btn-resume btn-resume-primary subscription-success-btn">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-modal-overlay active" role="dialog" aria-modal="true" aria-labelledby="simple-subscribe-title">
      <div className="subscription-modal-card">
        <button
          type="button"
          className="subscription-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 id="simple-subscribe-title" className="subscription-modal-title">
          Subscribe to {planName}
        </h2>
        <p className="subscription-modal-subtitle">
          ${planPrice} — no payment method required for this plan.
        </p>
        {error && <p className="subscription-modal-error" role="alert">{error}</p>}
        <div className="subscription-modal-actions">
          <button type="button" onClick={onClose} className="btn-resume">
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
                Subscribe
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
