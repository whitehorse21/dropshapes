'use client';

import React from 'react';
import { Loader2, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <p>Search and manage user accounts</p>
      </div>

      <section className="admin-section-card" aria-labelledby="admin-users-heading">
        <div className="admin-section-card-header">
          <Users className="admin-section-card-icon" aria-hidden />
          <h2 id="admin-users-heading" className="admin-section-card-title">
            All users
          </h2>
          <p className="admin-section-card-desc">
            Search by name or email and view activity.
          </p>
        </div>
        <div className="admin-section-card-body">
          <div className="admin-section-search-wrap">
            <Search className="admin-section-search-icon" aria-hidden />
            <input
              type="search"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-section-search-input"
              aria-label="Search users"
            />
          </div>
          <div className="admin-section-table-wrap">
            <table className="admin-section-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th className="text-center">AI Requests</th>
                  <th>Last Active</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="admin-section-loading-cell">
                      <Loader2 className="admin-section-spinner" aria-hidden />
                      <span>Loading users…</span>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-credits-user-cell">
                          {user.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt=""
                              className="admin-credits-avatar-img"
                            />
                          ) : (
                            <div className="admin-credits-avatar">
                              {(user.name || user.email || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="admin-credits-user-name">{user.name || '—'}</span>
                        </div>
                      </td>
                      <td className="admin-credits-email">{user.email}</td>
                      <td className="text-center font-medium" style={{ color: 'var(--accent)' }}>
                        {user.ai_requests}
                      </td>
                      <td className="admin-credits-email">{user.last_active ?? '—'}</td>
                      <td className="admin-credits-email">{user.created_at}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="admin-section-empty-cell">
                      <p>No users found</p>
                      <span>Try a different search</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav className="admin-section-pagination" aria-label="Users pagination">
              <span className="admin-section-pagination-info">
                Page {page} of {totalPages}
              </span>
              <div className="admin-section-pagination-buttons">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="admin-section-pagination-btn"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="admin-section-pagination-icon" aria-hidden />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="admin-section-pagination-btn"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="admin-section-pagination-icon" aria-hidden />
                </button>
              </div>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
