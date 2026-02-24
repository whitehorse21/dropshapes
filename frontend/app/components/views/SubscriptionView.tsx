"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2, X } from "lucide-react";
import apiService from "@/app/apimodule/utils/apiService";
import endpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import PlanCard from "@/app/subscription/components/PlanCard";
import SubscriptionModal from "@/app/subscription/components/SubscriptionModal";
import SimpleSubscribeModal from "@/app/subscription/components/SimpleSubscribeModal";
import type { SubscriptionPlan } from "@/app/subscription/types";

interface SubscriptionViewProps {
  stripeAvailable?: boolean;
}

export default function SubscriptionView({
  stripeAvailable = false,
}: SubscriptionViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await apiService.get(endpoints.subscriptions);
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPlans([]);
    }
  };

  const fetchMySubscription = async () => {
    try {
      const res = await apiService.get(endpoints.mySubscription);
      setCurrentPlan(res.data ?? null);
    } catch {
      setCurrentPlan(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchMySubscription()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await apiService.post(endpoints.subscriptionPortal, {});
      const url = (res.data as { url?: string })?.url;
      if (url) window.location.href = url;
      else throw new Error("No portal URL");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err.response as { data?: { detail?: string } })?.data?.detail;
      alert(
        typeof msg === "string"
          ? msg
          : "Unable to open billing portal. You can cancel below.",
      );
    } finally {
      setPortalLoading(false);
    }
  };

  const handleStripeCheckout = async (planId: number) => {
    setCheckoutLoading(true);
    try {
      const res = await apiService.post(endpoints.subscriptionCreateCheckoutSession, { plan_id: planId });
      const url = (res.data as { url?: string })?.url;
      if (url) window.location.href = url;
      else throw new Error("No checkout URL");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err.response as { data?: { detail?: string } })?.data?.detail;
      alert(typeof msg === "string" ? msg : "Could not start checkout. Try paying with card above.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await apiService.post(endpoints.subscriptionCancel, {});
      await fetchMySubscription();
      setCancelModalOpen(false);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err.response as { data?: { detail?: string } })?.data?.detail;
      alert(typeof msg === "string" ? msg : "Failed to cancel. Try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const selectedPlan =
    selectedPlanId != null ? plans.find((p) => p.id === selectedPlanId) : null;
  const hasStripeSubscription =
    currentPlan?.payment_provider === "stripe" &&
    currentPlan?.subscription_id != null;

  if (loading) {
    return (
      <section
        id="view-subscription"
        className="view-section active-view"
        aria-label="Subscription"
      >
        <div className="tool-page-wrap subscription-page-wrap">
          <div className="header-minimal">
            <h1>Subscription</h1>
            <p>Choose a plan that fits your workflow.</p>
          </div>
          <div className="subscription-loading">
            <Loader2 className="subscription-loading-spinner" aria-hidden />
            <p>Loading subscription plans...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="view-subscription"
      className="view-section active-view"
      aria-label="Subscription"
    >
      <div className="tool-page-wrap subscription-page-wrap">
        <div className="header-minimal">
          <h1>Subscription</h1>
          <p>
            Scale your content creation with flexible plans. Unlock resumes,
            cover letters, and AI tools.
          </p>
        </div>

        <div className="tool-page-nav subscription-page-nav">
          <button
            type="button"
            className="btn-resume"
            onClick={() => router.push("/")}
            aria-label="Back to Home"
          >
            ← Back to Home
          </button>
          {currentPlan && (
            <div className="subscription-nav-actions">
              {hasStripeSubscription ? (
                <button
                  type="button"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="subscription-btn-manage"
                >
                  {portalLoading ? (
                    <Loader2 className="subscription-btn-spinner" aria-hidden />
                  ) : (
                    <Shield
                      className="subscription-btn-manage-icon"
                      aria-hidden
                    />
                  )}
                  Manage Subscription
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  disabled={cancelLoading}
                  className="subscription-btn-cancel"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          )}
        </div>

        <div className="subscription-plans-grid">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              isSelected={selectedPlanId === plan.id}
              loading={false}
              onSelectPlan={setSelectedPlanId}
            />
          ))}
        </div>

        {plans.length === 0 && (
          <div className="subscription-empty">
            <p>No subscription plans available at the moment.</p>
            <Link href="/" className="btn-resume btn-resume-primary">
              Back to Home
            </Link>
          </div>
        )}

        {selectedPlanId != null && selectedPlan && stripeAvailable && (
          <>
            <SubscriptionModal
              planId={selectedPlanId}
              planName={selectedPlan.name}
              planPrice={selectedPlan.price}
              onClose={() => setSelectedPlanId(null)}
              onSuccess={() => {
                fetchMySubscription();
              }}
              onStripeCheckout={() => handleStripeCheckout(selectedPlanId)}
              checkoutLoading={checkoutLoading}
              stripePriceId={selectedPlan.stripe_price_id}
            />
          </>
        )}
        {selectedPlanId != null && selectedPlan && !stripeAvailable && (
          <SimpleSubscribeModal
            planId={selectedPlanId}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            onClose={() => setSelectedPlanId(null)}
            onSuccess={() => {
              fetchMySubscription();
            }}
          />
        )}

        {/* Cancel subscription confirmation modal */}
        {cancelModalOpen && (
          <div
            className="add-task-modal-overlay active"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-cancel-modal-title"
          >
            <div className="add-task-modal cancel-subscription-modal max-w-md w-full mx-4">
              <button
                type="button"
                className="add-task-modal-close"
                onClick={() => setCancelModalOpen(false)}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <h2
                id="subscription-cancel-modal-title"
                className="add-task-modal-title"
              >
                Cancel Subscription
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
                Are you sure you want to cancel? You will keep access until the
                end of the current billing period.
              </p>
              <div className="add-task-actions">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="add-task-cancel"
                >
                  Keep subscription
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="add-task-submit cancel-subscription-submit flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {cancelLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : null}
                  Cancel subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
