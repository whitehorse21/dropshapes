"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./BillingView.css";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, X } from "lucide-react";
import { jsPDF } from "jspdf";
import apiService from "@/app/apimodule/utils/apiService";
import endpoints from "@/app/apimodule/endpoints/ApiEndpoints";

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: string;
  plan: string;
  period: string;
  invoice_number?: string;
  payment_method?: string;
  currency: string;
}

interface BillingHistoryResponse {
  invoices: BillingHistoryItem[];
  total_count: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

interface UsageStats {
  usage: { resume_count: number; cover_letter_count: number };
  limits: {
    resume_limit: number | null;
    cover_letter_limit: number | null;
    ai_credits_limit?: number;
  };
  subscription_plan: string;
  can_create_resume: boolean;
  can_create_cover_letter: boolean;
  ai_credits_remaining?: number;
  ai_credits_limit?: number;
  ai_credits_used?: number;
}

interface CurrentPlan {
  id: number;
  name: string;
  price: number;
  interval: string;
  current_period_end: string;
  features?: string;
}

export default function BillingView() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [billing, setBilling] = useState<BillingHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [loadingCancellation, setLoadingCancellation] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchMySubscription = async () => {
    try {
      const res = await apiService.get(endpoints.mySubscription);
      setCurrentPlan(res.data ?? null);
    } catch {
      setCurrentPlan(null);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await apiService.get(endpoints.subscriptionUsage);
      setUsageStats(res.data ?? null);
    } catch {
      setUsageStats(null);
    }
  };

  const fetchBillingHistory = async () => {
    try {
      const res = await apiService.get(endpoints.billingHistory, {
        params: { page: 1, per_page: 20 },
      });
      setBilling(res.data ?? null);
    } catch {
      setBilling(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([
        fetchMySubscription(),
        fetchUsage(),
        fetchBillingHistory(),
      ]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    console.log("handleCancel");
  }, []);

  const handleCancel = async () => {
    setLoadingCancellation(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: "{}",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data?.detail;
        const msg =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail
                  .map((d: unknown) =>
                    typeof d === "object" && d && "msg" in d
                      ? (d as { msg?: string }).msg
                      : d,
                  )
                  .filter(Boolean)
                  .join(", ")
              : "Failed to cancel subscription. Try again.";
        alert(msg);
        return;
      }
      await Promise.all([
        fetchMySubscription(),
        fetchUsage(),
        fetchBillingHistory(),
      ]);
      setCancelOpen(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to cancel subscription. Try again.";
      alert(msg);
    } finally {
      setLoadingCancellation(false);
    }
  };

  const generateInvoicePdf = async (invoiceNumber: string) => {
    setDownloadingId(invoiceNumber);
    try {
      const res = await apiService.get(endpoints.billingInvoice(invoiceNumber));
      const invoice = res.data as {
        invoice_number: string;
        date: string;
        due_date: string | null;
        plan_name: string | null;
        billing_period: string | null;
        subtotal: number;
        tax_amount: number;
        total_amount: number;
        line_items: Array<{
          description: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        }>;
      };
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Invoice", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 40);
      doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 20, 48);
      if (invoice.due_date) {
        doc.text(
          `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`,
          20,
          56,
        );
      }
      doc.text(
        `Plan: ${invoice.plan_name ?? "N/A"}`,
        20,
        invoice.due_date ? 66 : 56,
      );
      doc.text(
        `Billing Period: ${invoice.billing_period ?? "N/A"}`,
        20,
        invoice.due_date ? 74 : 64,
      );
      let y = invoice.due_date ? 90 : 80;
      doc.text("Description", 20, y);
      doc.text("Qty", 120, y);
      doc.text("Unit Price", 140, y);
      doc.text("Total", 170, y);
      invoice.line_items?.forEach(
        (item: {
          description: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        }) => {
          y += 8;
          doc.text(item.description, 20, y);
          doc.text(String(item.quantity), 120, y);
          doc.text(`$${Number(item.unit_price).toFixed(2)}`, 140, y);
          doc.text(`$${Number(item.total_price).toFixed(2)}`, 170, y);
        },
      );
      y += 15;
      doc.text(`Subtotal: $${Number(invoice.subtotal).toFixed(2)}`, 140, y);
      y += 8;
      doc.text(`Tax: $${Number(invoice.tax_amount).toFixed(2)}`, 140, y);
      y += 8;
      doc.text(`Total: $${Number(invoice.total_amount).toFixed(2)}`, 140, y);
      y += 20;
      doc.text("Thank you for your payment!", 105, y, { align: "center" });
      doc.save(`${invoice.invoice_number}.pdf`);
    } catch {
      alert("Failed to download invoice.");
    } finally {
      setDownloadingId(null);
    }
  };

  const isUnlimitedResumes = usageStats?.limits?.resume_limit == null;
  const isUnlimitedCoverLetters =
    usageStats?.limits?.cover_letter_limit == null;

  if (loading) {
    return (
      <section
        id="view-billing"
        className="view-section active-view"
        aria-label="Billing"
      >
        <div className="header-minimal">
          <h1>Billing Information</h1>
        </div>
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2
            className="animate-spin w-8 h-8 text-[var(--accent)]"
            aria-hidden
          />
        </div>
      </section>
    );
  }

  return (
    <section
      id="view-billing"
      className="view-section active-view overflow-x-hidden"
      aria-label="Billing"
    >
      <div className="subscription-page-wrap billing-content-wrap">
        <div className="header-minimal">
          <h1>Billing Information</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage your billing details, usage, and invoice history
          </p>
        </div>
        <div className="subscription-page-nav">
          <Link
            href="/settings"
            className="subscription-nav-back"
            aria-label="Back to Settings"
          >
            <ChevronLeft className="subscription-nav-back-icon" aria-hidden />
            Back to Settings
          </Link>
        </div>
        <div className="settings-wrapper space-y-6 billing-settings-inner">
          {/* Current plan + usage */}
          <div className="group-title">CURRENT PLAN & USAGE</div>
          {currentPlan ? (
            <>
              <div className="settings-item flex flex-wrap items-start justify-between gap-4 p-4 rounded-xl bg-[var(--card-bg)]">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    {currentPlan.name} Plan
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    ${currentPlan.price}/{currentPlan.interval} • Billed{" "}
                    {currentPlan.interval}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Next billing date:{" "}
                    {new Date(
                      currentPlan.current_period_end,
                    ).toLocaleDateString()}
                  </p>
                  {currentPlan.features && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      {currentPlan.features}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCancelOpen(true);
                  }}
                  className="btn-action billing-cancel-trigger px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white border-0 cursor-pointer shrink-0"
                  aria-label="Cancel subscription"
                >
                  Cancel Subscription
                </button>
              </div>

              {usageStats && (
                <div className="billing-usage-grid">
                  <div className="billing-usage-card rounded-xl bg-[var(--card-bg)] min-w-0">
                    <span className="billing-usage-label">Resumes</span>
                    {isUnlimitedResumes ? (
                      <span className="billing-usage-value text-[var(--safe-green)]">
                        Unlimited
                      </span>
                    ) : (
                      <>
                        <span
                          className={`billing-usage-value ${
                            (usageStats.usage?.resume_count ?? 0) >
                            (usageStats.limits?.resume_limit ?? 0)
                              ? "text-red-500"
                              : "text-[var(--accent)]"
                          }`}
                        >
                          {usageStats.usage?.resume_count ?? 0}/
                          {usageStats.limits?.resume_limit ?? 0}
                        </span>
                        <div className="billing-usage-bar">
                          <div
                            className="bg-[var(--safe-green)]"
                            style={{
                              width: `${Math.min(
                                100,
                                ((usageStats.usage?.resume_count ?? 0) /
                                  (usageStats.limits?.resume_limit ?? 1)) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="billing-usage-status text-[var(--text-secondary)]">
                          {usageStats.can_create_resume
                            ? "Can create"
                            : "Limit reached"}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="billing-usage-card rounded-xl bg-[var(--card-bg)] min-w-0">
                    <span className="billing-usage-label">Cover Letters</span>
                    {isUnlimitedCoverLetters ? (
                      <span className="billing-usage-value text-[var(--safe-green)]">
                        Unlimited
                      </span>
                    ) : (
                      <>
                        <span
                          className={`billing-usage-value ${
                            (usageStats.usage?.cover_letter_count ?? 0) >
                            (usageStats.limits?.cover_letter_limit ?? 0)
                              ? "text-red-500"
                              : "text-[var(--accent)]"
                          }`}
                        >
                          {usageStats.usage?.cover_letter_count ?? 0}/
                          {usageStats.limits?.cover_letter_limit ?? 0}
                        </span>
                        <div className="billing-usage-bar">
                          <div
                            className="bg-[var(--safe-green)]"
                            style={{
                              width: `${Math.min(
                                100,
                                ((usageStats.usage?.cover_letter_count ?? 0) /
                                  (usageStats.limits?.cover_letter_limit ??
                                    1)) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="billing-usage-status text-[var(--text-secondary)]">
                          {usageStats.can_create_cover_letter
                            ? "Can create"
                            : "Limit reached"}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="billing-usage-card rounded-xl bg-[var(--card-bg)] min-w-0">
                    <span className="billing-usage-label">AI Credits</span>
                    <span
                      className={`billing-usage-value ${
                        (usageStats.ai_credits_remaining ?? 0) === 0
                          ? "text-red-500"
                          : "text-[var(--accent)]"
                      }`}
                    >
                      {(usageStats.ai_credits_remaining ?? 0).toLocaleString()}/
                      {(usageStats.ai_credits_limit ?? 0).toLocaleString()}
                    </span>
                    <div className="billing-usage-bar">
                      <div
                        className="bg-[var(--safe-green)]"
                        style={{
                          width: `${Math.min(
                            100,
                            ((usageStats.ai_credits_used ?? 0) /
                              (usageStats.ai_credits_limit ?? 1)) *
                              100,
                          )}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`billing-usage-status ${
                        (usageStats.ai_credits_remaining ?? 0) > 0
                          ? "text-[var(--safe-green)]"
                          : "text-red-500"
                      }`}
                    >
                      {(usageStats.ai_credits_remaining ?? 0) > 0
                        ? "Available"
                        : "Used up"}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-[var(--text-secondary)]">
              No active subscription.{" "}
              <Link
                href="/subscription"
                className="text-[var(--accent)] hover:underline"
              >
                Explore plans
              </Link>
            </p>
          )}

          {/* Billing history */}
          <div className="group-title">BILLING HISTORY</div>
          <div className="billing-history-wrap">
            {!billing?.invoices?.length ? (
              <div
                className="billing-empty-state"
                role="status"
                aria-label="No invoices"
              >
                <p className="text-[var(--text-secondary)] text-sm">
                  No invoices yet
                </p>
              </div>
            ) : (
              <div className="billing-table-wrap">
                <table className="billing-table" aria-label="Invoice history">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Plan</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing.invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="billing-table-id">{inv.id}</td>
                        <td>{new Date(inv.date).toLocaleDateString()}</td>
                        <td>{inv.plan}</td>
                        <td>{inv.period}</td>
                        <td className="billing-table-amount">
                          ${Number(inv.amount).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`billing-invoice-status ${inv.status === "paid" ? "billing-invoice-status--paid" : "billing-invoice-status--other"}`}
                          >
                            {inv.status === "paid" ? "Paid" : inv.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              generateInvoicePdf(inv.invoice_number ?? inv.id)
                            }
                            disabled={
                              downloadingId === (inv.invoice_number ?? inv.id)
                            }
                            className="billing-invoice-download"
                          >
                            {downloadingId === (inv.invoice_number ?? inv.id)
                              ? "Downloading…"
                              : "Download"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel subscription modal */}
      {cancelOpen && (
        <div
          className="add-task-modal-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div className="add-task-modal cancel-subscription-modal max-w-md w-full mx-4">
            <button
              type="button"
              className="add-task-modal-close"
              onClick={() => setCancelOpen(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 id="cancel-modal-title" className="add-task-modal-title">
              Cancel Subscription
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
              Are you sure you want to cancel? You will keep access until the
              end of the current billing period.
            </p>
            <div className="add-task-actions">
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="add-task-cancel"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loadingCancellation}
                className="add-task-submit cancel-subscription-submit flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loadingCancellation && (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
                Cancel subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
