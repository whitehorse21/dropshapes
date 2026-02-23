'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;

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

export default function AdminUserSubscriptionsPage() {
  const [data, setData] = useState<UserSubRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

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

  const fetchData = async (pageNum: number) => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = {
        page: pageNum,
        limit: pagination.limit,
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
  }, [page, search, isActiveFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, isActiveFilter]);

  const totalPages = pagination.total_pages || Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>User Subscriptions</h1>
        <p>View & filter subscription records</p>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
        <input
          type="search"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-clean w-full sm:max-w-xs text-left"
          aria-label="Search"
        />
        <div className="admin-status-select" ref={statusDropdownRef}>
          <button
            type="button"
            className="admin-status-select-trigger"
            onClick={() => setStatusDropdownOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={statusDropdownOpen}
            aria-label="Filter by status"
          >
            <span>{STATUS_OPTIONS.find((o) => o.value === isActiveFilter)?.label ?? 'All Status'}</span>
            <svg className="admin-status-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {statusDropdownOpen && (
            <ul
              className="admin-status-select-dropdown"
              role="listbox"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <li
                  key={opt.value === '' ? 'all' : opt.value}
                  role="option"
                  aria-selected={isActiveFilter === opt.value}
                  className="admin-status-select-option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsActiveFilter(opt.value);
                    setStatusDropdownOpen(false);
                  }}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">User</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Plan</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)] hidden md:table-cell">Start</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)] hidden md:table-cell">End</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Payment</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)]">Amount</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)] hidden lg:table-cell">Resume Limit</th>
              <th className="px-4 py-3 font-medium text-[var(--text-primary)] hidden lg:table-cell">Cover Letter Limit</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--accent)]" aria-hidden />
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row) => (
                <tr
                  key={`${row.user_id}-${row.subscription_id || 'free'}`}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)]"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{row.user_name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{row.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{row.subscription_plan}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell">
                    {row.start_date ? new Date(row.start_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] hidden md:table-cell">
                    {row.end_date ? new Date(row.end_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 capitalize text-[var(--text-secondary)]">{row.payment_status}</td>
                  <td className="px-4 py-3">
                    {row.amount} {row.currency}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">{row.resumes_limit}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{row.cover_letters_limit}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 sm:gap-4 py-2">
          <p className="text-sm text-[var(--text-secondary)] order-2 sm:order-1">
            Page {page} of {totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-action w-auto px-4 py-2 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-action w-auto px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
