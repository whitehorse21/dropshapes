'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import useAdminUsers from '@/app/hooks/useAdminUsers';

export default function AdminUsersPage() {
  const {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
  } = useAdminUsers(20);

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>Users</h1>
        <p>Search & manage accounts</p>
      </div>

      <input
        type="search"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input-clean w-full max-w-md text-left"
        aria-label="Search users"
      />

      <div className="admin-table-wrap">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Name</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Email</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)] text-center">AI Requests</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Last Active</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" aria-hidden />
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover border border-[var(--border)]"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-semibold text-[var(--accent)]">
                          {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-[var(--text-primary)]">{user.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="px-4 py-3 text-center font-medium text-[var(--accent)]">
                    {user.ai_requests}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user.last_active ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user.created_at}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 py-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-action w-auto px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-[var(--text-secondary)]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-action w-auto px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
