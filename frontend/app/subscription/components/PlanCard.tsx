'use client';

import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import FeaturesList from './FeaturesList';
import type { SubscriptionPlan } from '../types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan: SubscriptionPlan | null;
  isSelected: boolean;
  loading: boolean;
  onSelectPlan: (planId: number) => void;
}

export default function PlanCard({
  plan,
  currentPlan,
  isSelected,
  loading,
  onSelectPlan,
}: PlanCardProps) {
  const [showUpgradeInfo, setShowUpgradeInfo] = useState(false);
  const isCurrentPlan = Boolean(
    currentPlan &&
      currentPlan.name?.toLowerCase() === plan.name?.toLowerCase() &&
      currentPlan.price === plan.price &&
      currentPlan.interval === plan.interval
  );

  const handleClick = () => {
    if (currentPlan && !isCurrentPlan) {
      setShowUpgradeInfo(true);
      return;
    }
    if (!isCurrentPlan) onSelectPlan(plan.id);
  };

  const isPopular = (plan as { popular?: boolean }).popular;
  const gradient = isPopular
    ? 'subscription-card-popular'
    : plan.price === 0
      ? 'subscription-card-free'
      : 'subscription-card-default';

  return (
    <>
      <div
        className={`subscription-plan-card ${gradient} ${isSelected ? 'subscription-plan-card-selected' : ''}`}
      >
        {isPopular && (
          <div className="subscription-plan-badge subscription-plan-badge-popular">
            <Crown className="subscription-plan-badge-icon" aria-hidden />
            Most Popular
          </div>
        )}
        {isCurrentPlan && (
          <div className="subscription-plan-badge subscription-plan-badge-current">
            <span className="subscription-plan-badge-dot" aria-hidden />
            Current Plan
          </div>
        )}

        <div className="subscription-plan-body">
          <div className="subscription-plan-header">
            <div className={`subscription-plan-icon ${gradient}`}>
              <span aria-hidden>
                {isPopular ? '👑' : plan.price === 0 ? '🎯' : '⚡'}
              </span>
            </div>
            <h3 className="subscription-plan-name">{plan.name}</h3>
            {plan.description && (
              <p className="subscription-plan-desc">{plan.description}</p>
            )}

            <div className="subscription-plan-price-wrap">
              <div className="subscription-plan-price">
                ${plan.price}
                {plan.price > 0 && (
                  <span className="subscription-plan-interval">
                    /{plan.interval}
                  </span>
                )}
              </div>
              {plan.price > 0 && (
                <p className="subscription-plan-billing">
                  Billed {plan.interval === 'yearly' ? 'annually' : 'monthly'}
                </p>
              )}
            </div>
          </div>

          <div className="subscription-plan-features">
            <FeaturesList featuresString={plan.features || ''} />
          </div>

          <button
            type="button"
            onClick={handleClick}
            disabled={loading || isCurrentPlan}
            className={`subscription-plan-cta ${gradient} ${isCurrentPlan ? 'subscription-plan-cta-current' : ''}`}
          >
            {loading ? (
              <>
                <span className="subscription-plan-cta-spinner" aria-hidden />
                Processing...
              </>
            ) : isCurrentPlan ? (
              <>
                <span className="subscription-plan-badge-dot" aria-hidden />
                Current Plan
              </>
            ) : currentPlan ? (
              'Upgrade Now'
            ) : (
              'Get Started'
            )}
          </button>
        </div>
      </div>

      {showUpgradeInfo && (
        <div className="subscription-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upgrade-info-title">
          <div className="subscription-upgrade-info-card">
            <div className="subscription-upgrade-info-icon" aria-hidden>
              ⚠️
            </div>
            <h2 id="upgrade-info-title" className="subscription-upgrade-info-title">
              Active Plan Detected
            </h2>
            <p className="subscription-upgrade-info-text">
              You already have an active plan. To change plan, use Manage
              Subscription to update or cancel your current subscription first.
            </p>
            <div className="subscription-upgrade-info-actions">
              <button
                type="button"
                onClick={() => setShowUpgradeInfo(false)}
                className="btn-resume btn-resume-primary"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
