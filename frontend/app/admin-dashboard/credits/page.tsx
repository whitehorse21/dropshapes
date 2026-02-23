"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
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
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>Credits</h1>
        <p>Give trial credits or add to admin</p>
      </div>

      {message ? (
        <div
          className={
            message.type === "success"
              ? "admin-credits-message rounded-lg px-5 py-3 text-sm bg-(--safe-green)/20 text-(--safe-green)"
              : "admin-credits-message rounded-lg px-5 py-3 text-sm bg-(--danger-red)/20 text-(--danger-red)"
          }
        >
          {message.text}
        </div>
      ) : null}

      <div className="group-title">GIVE TRIAL CREDITS</div>
      <div className="admin-card admin-credits-admin-card">
        <h2 className="font-semibold text-(--text-primary) m-0">
          Give trial credits to user
        </h2>
        <div className="admin-credits-section-body p-5 sm:p-6">
          <label
            htmlFor="admin-credits-search-users"
            className="admin-credits-label block text-sm font-medium text-(--text-secondary) mb-4"
          >
            Search by name or email
          </label>
          <input
            id="admin-credits-search-users"
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-clean admin-credits-input w-full max-w-md text-left"
            aria-label="Search users"
          />
          <div className="admin-table-wrap mt-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-(--border) bg-(--surface)">
                  <th className="px-5 py-4 font-medium text-(--text-primary)">
                    Name
                  </th>
                  <th className="px-5 py-4 font-medium text-(--text-primary)">
                    Email
                  </th>
                  <th className="px-5 py-4 font-medium text-(--text-primary)">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-(--accent)" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center text-(--text-secondary) admin-table-empty-cell"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-(--border) hover:bg-(--card-hover)"
                    >
                      <td className="px-5 py-4 font-medium text-(--text-primary)">
                        {user.name || "—"}
                      </td>
                      <td className="px-5 py-4 text-(--text-secondary)">
                        {user.email}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => giveTrialToUser(user.email)}
                          disabled={addingForEmail === user.email}
                          className="btn-action w-auto px-3 py-1.5 text-sm bg-(--accent) border-(--accent) text-white disabled:opacity-50"
                        >
                          {addingForEmail === user.email
                            ? "Adding…"
                            : "Give trial credits"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-action w-auto px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-(--text-secondary)">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn-action w-auto px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="group-title">ADMIN CREDITS</div>
      <div className="admin-card admin-credits-admin-card">
        <h2 className="font-semibold text-(--text-primary) m-0 mb-5">
          Add credits to admin account
        </h2>
        <label
          className="admin-credits-label block text-sm font-medium text-(--text-secondary) mb-4"
          htmlFor="admin-credits-amount"
        >
          Number of credits
        </label>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 sm:gap-5">
          <input
            id="admin-credits-amount"
            type="number"
            min={1}
            value={adminCreditAmount}
            onChange={(e) => setAdminCreditAmount(Number(e.target.value) || 0)}
            className="input-clean w-full sm:w-36 text-left"
            aria-label="Credit amount"
          />
          <button
            type="button"
            onClick={addCreditsToAdmin}
            disabled={addingAdmin}
            className="btn-action w-full sm:w-auto px-4 py-2 bg-(--accent) border-(--accent) text-white disabled:opacity-50"
          >
            {addingAdmin ? "Adding…" : "Add credits (admin)"}
          </button>
        </div>
      </div>
    </div>
  );
}
