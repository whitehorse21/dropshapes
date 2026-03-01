'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Search, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;

const LIMIT_OPTIONS = [10, 20, 50] as const;

interface UserSubRecord {
  subscription_id: string | null;
  user_id: number;
  user_name: string;
  email: string;
  subscription_plan: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string | null;
  payment_status: string;
  amount: number;
  currency: string;
  resumes_limit: number;
  cover_letters_limit: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPaymentStatus(s: string) {
  const lower = (s || '').toLowerCase();
  if (lower === 'paid' || lower === 'active') return 'paid';
  if (lower === 'past_due' || lower === 'unpaid') return 'warning';
  return 'neutral';
}

export default function AdminUserSubscriptionsPage() {
  const [data, setData] = useState<UserSubRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [limit, setLimit] = useState(10);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [limitDropdownOpen, setLimitDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const limitDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [statusDropdownOpen]);

  useEffect(() => {
    if (!limitDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (limitDropdownRef.current && !limitDropdownRef.current.contains(e.target as Node)) {
        setLimitDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [limitDropdownOpen]);

  const fetchData = async (pageNum: number) => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = {
        page: pageNum,
        limit,
      };
      if (search.trim()) params.search = search.trim();
      if (isActiveFilter === 'true') params.is_active = true;
      if (isActiveFilter === 'false') params.is_active = false;

      const res = await apiService.get(endpoints.adminUserSubscriptions, { params });
      const body = res.data as { success?: boolean; data?: UserSubRecord[]; pagination?: Pagination };
      if (body.success && Array.isArray(body.data)) {
        setData(body.data);
        if (body.pagination) setPagination(body.pagination);
      } else {
        setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page, search, isActiveFilter, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, isActiveFilter, limit]);

  const totalPages = pagination.total_pages || Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="admin-content user-subs-page">
      <div className="admin-page-header">
        <h1>User Subscriptions</h1>
        <p>View and filter subscription records</p>
      </div>

      <section className="admin-section-card" aria-labelledby="user-subs-heading">
        <div className="admin-section-card-header">
          <CreditCard className="admin-section-card-icon" aria-hidden />
          <h2 id="user-subs-heading" className="admin-section-card-title">
            Subscription records
          </h2>
          <p className="admin-section-card-desc">
            Search by name or email and filter by status.
          </p>
        </div>
        <div className="admin-section-card-body">
      {/* Filters */}
      <div className="user-subs-filters">
        <div className="user-subs-search-wrap">
          <Search className="user-subs-search-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="user-subs-search-input"
            aria-label="Search"
          />
        </div>
        <div className="user-subs-dropdowns" role="group" aria-label="Table options">
          <div className="user-subs-dropdown user-subs-dropdown-status" ref={statusDropdownRef}>
            <label className="user-subs-dropdown-label" htmlFor="user-subs-status-trigger">
              STATUS
            </label>
            <div className="admin-status-select user-subs-trigger-wrap">
              <button
                id="user-subs-status-trigger"
                type="button"
                className="admin-status-select-trigger user-subs-trigger"
                onClick={() => { setStatusDropdownOpen((o) => !o); setLimitDropdownOpen(false); }}
                aria-haspopup="listbox"
                aria-expanded={statusDropdownOpen}
                aria-label="Filter by subscription status"
              >
                <span className="user-subs-dropdown-value">{STATUS_OPTIONS.find((o) => o.value === isActiveFilter)?.label ?? 'All Status'}</span>
                <svg className="admin-status-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {statusDropdownOpen && (
                <ul className="admin-status-select-dropdown user-subs-dropdown-list" role="listbox" aria-label="Filter by status">
                  {STATUS_OPTIONS.map((opt) => (
                    <li
                      key={opt.value === '' ? 'all' : opt.value}
                      role="option"
                      aria-selected={isActiveFilter === opt.value}
                      className="admin-status-select-option"
                      onMouseDown={(e) => { e.preventDefault(); setIsActiveFilter(opt.value); setStatusDropdownOpen(false); }}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="user-subs-dropdown user-subs-dropdown-limit" ref={limitDropdownRef}>
            <label className="user-subs-dropdown-label" htmlFor="user-subs-limit-trigger">
              PER PAGE
            </label>
            <div className="admin-status-select user-subs-trigger-wrap">
              <button
                id="user-subs-limit-trigger"
                type="button"
                className="admin-status-select-trigger user-subs-trigger"
                onClick={() => { setLimitDropdownOpen((o) => !o); setStatusDropdownOpen(false); }}
                aria-haspopup="listbox"
                aria-expanded={limitDropdownOpen}
                aria-label="Rows per page"
              >
                <span className="user-subs-dropdown-value">{limit}</span>
                <svg className="admin-status-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {limitDropdownOpen && (
                <ul className="admin-status-select-dropdown user-subs-dropdown-list" role="listbox" aria-label="Rows per page">
                  {LIMIT_OPTIONS.map((n) => (
                    <li
                      key={n}
                      role="option"
                      aria-selected={limit === n}
                      className="admin-status-select-option"
                      onMouseDown={(e) => { e.preventDefault(); setLimit(n); setLimitDropdownOpen(false); }}
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="user-subs-table-wrap">
        <div className="user-subs-table-scroll">
          <table className="user-subs-table">
            <colgroup>
              <col className="user-subs-col-user" />
              <col className="user-subs-col-plan" />
              <col className="user-subs-col-date" />
              <col className="user-subs-col-date" />
              <col className="user-subs-col-status" />
              <col className="user-subs-col-payment" />
              <col className="user-subs-col-amount" />
              <col className="user-subs-col-optional" />
              <col className="user-subs-col-optional" />
            </colgroup>
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th className="user-subs-th-date">Start</th>
                <th className="user-subs-th-date">End</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="user-subs-th-num">Amount</th>
                <th className="user-subs-th-num user-subs-th-optional">Resumes</th>
                <th className="user-subs-th-num user-subs-th-optional">Cover letters</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="user-subs-loading-cell">
                    <Loader2 className="user-subs-spinner" aria-hidden />
                    <span>Loading…</span>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row) => (
                  <tr key={`${row.user_id}-${row.subscription_id || 'free'}`}>
                    <td>
                      <div className="user-subs-user-cell">
                        <div className="user-subs-avatar">
                          {(row.user_name || row.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="user-subs-user-info">
                          <span className="user-subs-name">{row.user_name || '—'}</span>
                          <span className="user-subs-email">{row.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="user-subs-plan">{row.subscription_plan}</span>
                    </td>
                    <td className="user-subs-date">{formatDate(row.start_date)}</td>
                    <td className="user-subs-date">{formatDate(row.end_date)}</td>
                    <td>
                      <span className={`user-subs-badge user-subs-badge-${row.is_active ? 'active' : 'inactive'}`}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`user-subs-badge user-subs-badge-payment user-subs-badge-${formatPaymentStatus(row.payment_status)}`}>
                        {row.payment_status || '—'}
                      </span>
                    </td>
                    <td className="user-subs-amount">
                      {row.amount} {row.currency}
                    </td>
                    <td className="user-subs-num user-subs-cell-optional">{row.resumes_limit === -1 ? '∞' : row.resumes_limit}</td>
                    <td className="user-subs-num user-subs-cell-optional">{row.cover_letters_limit === -1 ? '∞' : row.cover_letters_limit}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="user-subs-empty-cell">
                    <CreditCard className="user-subs-empty-icon" aria-hidden />
                    <p>No subscription records found</p>
                    <span>Try adjusting search or filters</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="user-subs-cards">
        {loading ? (
          <div className="user-subs-loading-card">
            <Loader2 className="user-subs-spinner" aria-hidden />
            <span>Loading…</span>
          </div>
        ) : data.length > 0 ? (
          data.map((row) => (
            <article key={`${row.user_id}-${row.subscription_id || 'free'}`} className="user-subs-card">
              <div className="user-subs-card-header">
                <div className="user-subs-user-cell">
                  <div className="user-subs-avatar">{ (row.user_name || row.email || '?').charAt(0).toUpperCase() }</div>
                  <div className="user-subs-user-info">
                    <span className="user-subs-name">{row.user_name || '—'}</span>
                    <span className="user-subs-email">{row.email}</span>
                  </div>
                </div>
                <span className={`user-subs-badge user-subs-badge-${row.is_active ? 'active' : 'inactive'}`}>
                  {row.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <dl className="user-subs-card-dl">
                <div>
                  <dt>Plan</dt>
                  <dd>{row.subscription_plan}</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>
                    <span className={`user-subs-badge user-subs-badge-payment user-subs-badge-${formatPaymentStatus(row.payment_status)}`}>
                      {row.payment_status || '—'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd>{row.amount} {row.currency}</dd>
                </div>
                <div>
                  <dt>Start</dt>
                  <dd>{formatDate(row.start_date)}</dd>
                </div>
                <div>
                  <dt>End</dt>
                  <dd>{formatDate(row.end_date)}</dd>
                </div>
                <div>
                  <dt>Resumes</dt>
                  <dd>{row.resumes_limit === -1 ? 'Unlimited' : row.resumes_limit}</dd>
                </div>
                <div>
                  <dt>Cover letters</dt>
                  <dd>{row.cover_letters_limit === -1 ? 'Unlimited' : row.cover_letters_limit}</dd>
                </div>
              </dl>
            </article>
          ))
        ) : (
          <div className="user-subs-empty-card">
            <CreditCard className="user-subs-empty-icon" aria-hidden />
            <p>No subscription records found</p>
            <span>Try adjusting search or filters</span>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="user-subs-pagination" aria-label="Pagination">
          <p className="user-subs-pagination-info">
            Page {page} of {totalPages} · {pagination.total} total
          </p>
          <div className="user-subs-pagination-buttons">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="user-subs-pagination-btn"
              aria-label="Previous page"
            >
              <ChevronLeft className="user-subs-pagination-icon" aria-hidden />
              <span>Prev</span>
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="user-subs-pagination-btn"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight className="user-subs-pagination-icon" aria-hidden />
            </button>
          </div>
        </nav>
      )}
        </div>
      </section>
    </div>
  );
}
