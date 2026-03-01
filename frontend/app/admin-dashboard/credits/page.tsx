"use client";

import React, { useState } from "react";
import { Loader2, Search, Gift, Wallet, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import apiService from "@/app/apimodule/utils/apiService";
import endpoints from "@/app/apimodule/endpoints/ApiEndpoints";
import { useAdminUsers } from "@/app/hooks/useAdminUsers";

export default function AdminCreditsPage() {
  const {
    users,
    loading: usersLoading,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
  } = useAdminUsers(15);
  const [adminCreditAmount, setAdminCreditAmount] = useState(10);
  const [addingForEmail, setAddingForEmail] = useState<string | null>(null);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const giveTrialToUser = async (email: string) => {
    setAddingForEmail(email);
    setMessage(null);
    try {
      await apiService.post(
        `${endpoints.adminCreditsGiveTrial}?user_email=${encodeURIComponent(email)}`,
        {},
      );
      setMessage({ type: "success", text: `Trial credits given to ${email}` });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setMessage({
        type: "error",
        text:
          typeof detail === "string" ? detail : "Failed to give trial credits",
      });
    } finally {
      setAddingForEmail(null);
    }
  };

  const addCreditsToAdmin = async () => {
    setAddingAdmin(true);
    setMessage(null);
    try {
      await apiService.post(
        `${endpoints.adminCreditsAdd}?credits=${adminCreditAmount}`,
        {},
      );
      setMessage({
        type: "success",
        text: `Added ${adminCreditAmount} credits to your account`,
      });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setMessage({
        type: "error",
        text: typeof detail === "string" ? detail : "Failed to add credits",
      });
    } finally {
      setAddingAdmin(false);
    }
  };

  return (
    <div className="admin-content admin-credits-page">
      <div className="admin-page-header">
        <h1>Credits</h1>
        <p>Give trial credits to users or add credits to your admin account</p>
      </div>

      {message && (
        <div
          className={`admin-credits-message admin-credits-message-${message.type}`}
          role="status"
        >
          {message.type === "success" ? (
            <CheckCircle2 className="admin-credits-message-icon" aria-hidden />
          ) : (
            <AlertCircle className="admin-credits-message-icon" aria-hidden />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <section className="admin-credits-card" aria-labelledby="credits-trial-heading">
        <div className="admin-credits-card-header">
          <Gift className="admin-credits-card-icon" aria-hidden />
          <h2 id="credits-trial-heading" className="admin-credits-card-title">
            Give trial credits
          </h2>
          <p className="admin-credits-card-desc">Search users and grant trial credits to their account.</p>
        </div>
        <div className="admin-credits-card-body">
          <div className="admin-credits-search-wrap">
            <Search className="admin-credits-search-icon" aria-hidden />
            <input
              id="admin-credits-search-users"
              type="search"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-credits-search-input"
              aria-label="Search users"
            />
          </div>
          <div className="admin-credits-table-wrap">
            <table className="admin-credits-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={3} className="admin-credits-loading-cell">
                      <Loader2 className="admin-credits-spinner" aria-hidden />
                      <span>Loading users…</span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="admin-credits-empty-cell">
                      <p>No users found</p>
                      <span>Try a different search</span>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-credits-user-cell">
                          <div className="admin-credits-avatar">
                            {(user.name || user.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="admin-credits-user-name">{user.name || "—"}</span>
                        </div>
                      </td>
                      <td className="admin-credits-email">{user.email}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => giveTrialToUser(user.email)}
                          disabled={addingForEmail === user.email}
                          className="admin-credits-btn admin-credits-btn-primary"
                        >
                          {addingForEmail === user.email ? (
                            <>
                              <Loader2 className="admin-credits-btn-spinner" aria-hidden />
                              Adding…
                            </>
                          ) : (
                            "Give trial credits"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav className="admin-credits-pagination" aria-label="Users pagination">
              <span className="admin-credits-pagination-info">
                Page {page} of {totalPages}
              </span>
              <div className="admin-credits-pagination-buttons">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="admin-credits-pagination-btn"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="admin-credits-pagination-icon" aria-hidden />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="admin-credits-pagination-btn"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="admin-credits-pagination-icon" aria-hidden />
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>

      <section className="admin-credits-card" aria-labelledby="credits-admin-heading">
        <div className="admin-credits-card-header">
          <Wallet className="admin-credits-card-icon" aria-hidden />
          <h2 id="credits-admin-heading" className="admin-credits-card-title">
            Add credits to admin
          </h2>
          <p className="admin-credits-card-desc">Add AI credits to your own admin account.</p>
        </div>
        <div className="admin-credits-card-body admin-credits-admin-section">
          <label htmlFor="admin-credits-amount" className="admin-credits-field-label">
            Number of credits
          </label>
          <div className="admin-credits-admin-row">
            <input
              id="admin-credits-amount"
              type="number"
              min={1}
              value={adminCreditAmount}
              onChange={(e) => setAdminCreditAmount(Math.max(0, Number(e.target.value) || 0))}
              className="admin-credits-amount-input"
              aria-label="Credit amount"
            />
            <button
              type="button"
              onClick={addCreditsToAdmin}
              disabled={addingAdmin || adminCreditAmount < 1}
              className="admin-credits-btn admin-credits-btn-primary admin-credits-btn-add"
            >
              {addingAdmin ? (
                <>
                  <Loader2 className="admin-credits-btn-spinner" aria-hidden />
                  Adding…
                </>
              ) : (
                "Add credits"
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
