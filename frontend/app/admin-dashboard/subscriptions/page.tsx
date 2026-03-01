"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Plus, Loader2, X, CreditCard, AlertCircle } from "lucide-react";
import apiService from "@/app/apimodule/utils/apiService";
import endpoints from "@/app/apimodule/endpoints/ApiEndpoints";

interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  interval: string;
  resume_limit: number;
  cover_letter_limit: number;
  is_active?: boolean;
  stripe_price_id?: string;
}

const defaultNewPlan = {
  name: "",
  description: "",
  price: 0,
  interval: "monthly",
  resume_limit: -1,
  cover_letter_limit: -1,
  is_active: true,
  stripe_price_id: "",
};

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingPlan, setEditingPlan] = useState<
    Plan | (Omit<Plan, "id"> & { id?: number }) | null
  >(null);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.get(endpoints.subscriptions);
      setPlans(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openEdit = (plan: Plan) => {
    setError(null);
    setIsCreateMode(false);
    setEditingPlan({ ...plan });
    setModalOpen(true);
  };

  const openAdd = () => {
    setError(null);
    setIsCreateMode(true);
    setEditingPlan({ ...defaultNewPlan });
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!editingPlan) return;
    if (!editingPlan.name?.trim()) {
      setError("Plan name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiService.post(endpoints.adminPlansCreate, {
        name: editingPlan.name.trim(),
        description: editingPlan.description ?? "",
        price: Number(editingPlan.price),
        interval: editingPlan.interval || "monthly",
        resume_limit: Number(editingPlan.resume_limit),
        cover_letter_limit: Number(editingPlan.cover_letter_limit),
        is_active: editingPlan.is_active ?? true,
        stripe_price_id:
          (
            editingPlan as { stripe_price_id?: string }
          ).stripe_price_id?.trim() || null,
      });
      setModalOpen(false);
      setEditingPlan(null);
      await fetchPlans();
    } catch {
      setError("Failed to create plan");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editingPlan?.id) return;
    setSaving(true);
    setError(null);
    try {
      await apiService.put(endpoints.adminPlansUpdate(editingPlan.id), {
        name: editingPlan.name,
        description: editingPlan.description ?? "",
        price: editingPlan.price,
        interval: editingPlan.interval,
        resume_limit: editingPlan.resume_limit,
        cover_letter_limit: editingPlan.cover_letter_limit,
        is_active: editingPlan.is_active ?? true,
      });
      setModalOpen(false);
      setEditingPlan(null);
      await fetchPlans();
    } catch {
      setError("Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-page-header">
          <h1>Subscription Plans</h1>
          <p>Add, edit plans, limits and pricing</p>
        </div>
        <section className="admin-section-card">
          <div className="admin-section-card-body">
            <div className="admin-section-loading-cell" style={{ margin: 0 }}>
              <Loader2 className="admin-section-spinner" aria-hidden />
              <span>Loading plans…</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>Subscription Plans</h1>
        <p>Add, edit plans, limits and pricing</p>
      </div>

      <section className="admin-section-card" aria-labelledby="admin-plans-heading">
        <div className="admin-section-card-header">
          <CreditCard className="admin-section-card-icon" aria-hidden />
          <h2 id="admin-plans-heading" className="admin-section-card-title">
            Plans
          </h2>
          <p className="admin-section-card-desc">
            Manage plan names, prices, limits and visibility.
          </p>
        </div>
        <div className="admin-section-card-body">
          {error && (
            <div className="admin-credits-message admin-credits-message-error" role="alert">
              <AlertCircle className="admin-credits-message-icon" aria-hidden />
              <span>{error}</span>
            </div>
          )}
          <button
            type="button"
            onClick={openAdd}
            className="admin-section-btn-primary flex items-center gap-2 mb-4"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add plan
          </button>

          <div className="admin-section-table-wrap">
            <table className="admin-section-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Interval</th>
                  <th>Resume Limit</th>
                  <th>Cover Letter Limit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="admin-section-empty-cell">
                      <p>No plans found</p>
                      <span>Add a plan to get started</span>
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="font-medium text-[var(--text-primary)]">
                        {plan.name}
                      </td>
                      <td className="text-[var(--text-secondary)] max-w-[200px] truncate">
                        {plan.description ?? "—"}
                      </td>
                      <td>
                        ${plan.price}
                        {plan.price === 0 ? " (Free)" : ""}
                      </td>
                      <td className="text-[var(--text-secondary)]">
                        {plan.interval}
                      </td>
                      <td>
                        {plan.resume_limit === -1 ? "Unlimited" : plan.resume_limit}
                      </td>
                      <td>
                        {plan.cover_letter_limit === -1
                          ? "Unlimited"
                          : plan.cover_letter_limit}
                      </td>
                      <td>
                        <span
                          className={
                            plan.is_active !== false
                              ? "text-[var(--safe-green)]"
                              : "text-[var(--danger-red)]"
                          }
                        >
                          {plan.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => openEdit(plan)}
                          className="admin-table-action-btn"
                          aria-label={`Edit ${plan.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {modalOpen && editingPlan && (
        <div
          className={`add-task-modal-overlay ${modalOpen ? "active" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalOpen(false);
              setEditingPlan(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-modal-title"
        >
          <div
            className="add-task-modal plan-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="add-task-modal-close"
              onClick={() => {
                setModalOpen(false);
                setEditingPlan(null);
              }}
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <h2 id="plan-modal-title" className="add-task-modal-title">
              {isCreateMode ? "Add Plan" : "Edit Plan"}
            </h2>

            {/* Body */}
            <div className="plan-modal-body">
              <div className="w-full min-w-0 space-y-6 sm:space-y-8 md:space-y-9">
                {/* Basic info — full-width fields */}
                <section className="w-full min-w-0 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Basic info
                  </h3>
                  <div className="w-full min-w-0 space-y-4 sm:space-y-5">
                    <div className="w-full min-w-0">
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            name: e.target.value,
                          })
                        }
                        className="input-clean w-full min-w-0 max-w-full box-border px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl text-left min-h-[48px]"
                        placeholder="e.g. Pro Monthly"
                      />
                    </div>
                    <div className="w-full min-w-0">
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingPlan.description ?? ""}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            description: e.target.value,
                          })
                        }
                        className="input-clean w-full min-w-0 max-w-full box-border px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl text-left min-h-[100px] resize-y"
                        rows={3}
                        placeholder="Optional short description"
                      />
                    </div>
                    {isCreateMode && (
                      <div className="w-full min-w-0">
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Stripe Price ID{" "}
                          <span className="text-[var(--text-secondary)] font-normal">
                            (optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={
                            (editingPlan as { stripe_price_id?: string })
                              .stripe_price_id ?? ""
                          }
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              stripe_price_id: e.target.value,
                            })
                          }
                          className="input-clean w-full min-w-0 max-w-full box-border px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl text-left font-mono text-sm min-h-[48px]"
                          placeholder="price_xxx"
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Pricing — two-column on desktop, full width on mobile */}
                <section className="w-full min-w-0 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Pricing
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 w-full min-w-0 gap-4 sm:gap-5">
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        value={editingPlan.price}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            price: Number(e.target.value),
                          })
                        }
                        className="input-clean w-full min-w-0 max-w-full box-border px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl text-left min-h-[48px]"
                        min={0}
                        step={0.01}
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Interval
                      </label>
                      <select
                        value={editingPlan.interval}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            interval: e.target.value,
                          })
                        }
                        className="input-clean w-full min-w-0 max-w-full box-border px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl text-left min-h-[48px] cursor-pointer"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Limits — two-column on desktop, full width on mobile */}
                <section className="w-full min-w-0 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Limits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 w-full min-w-0 gap-4 sm:gap-5">
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Resume limit
                      </label>
                      <input
                        type="number"
                        value={editingPlan.resume_limit}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            resume_limit: Number(e.target.value),
                          })
                        }
                        className="input-clean w-full min-w-0 max-w-full box-border px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl text-left min-h-[48px]"
                        min={-1}
                      />
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        -1 = unlimited
                      </p>
                    </div>
                    <div className="min-w-0">
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Cover letter limit
                      </label>
                      <input
                        type="number"
                        value={editingPlan.cover_letter_limit}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            cover_letter_limit: Number(e.target.value),
                          })
                        }
                        className="input-clean w-full min-w-0 max-w-full box-border px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl text-left min-h-[48px]"
                        min={-1}
                      />
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        -1 = unlimited
                      </p>
                    </div>
                  </div>
                </section>

                {/* Status */}
                <div className="w-full min-w-0 pt-4 sm:pt-5 border-t border-[var(--border)]">
                  <label className="flex items-center gap-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={editingPlan.is_active !== false}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-[var(--border)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      Plan is active (visible to users)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="add-task-actions plan-modal-footer">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditingPlan(null);
                }}
                className="btn-action rounded-xl w-full sm:w-auto px-5 py-3.5 min-h-[48px] text-[15px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={isCreateMode ? handleCreate : handleSave}
                disabled={saving || (isCreateMode && !editingPlan.name?.trim())}
                className="plan-modal-submit rounded-xl whitespace-nowrap flex items-center justify-center w-full sm:w-auto px-6 py-3.5 min-h-[48px] min-w-[160px] text-[15px] border"
              >
                {saving
                  ? isCreateMode
                    ? "Creating…"
                    : "Saving…"
                  : isCreateMode
                    ? "Create plan"
                    : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
