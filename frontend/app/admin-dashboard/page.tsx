'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Cpu,
  DollarSign,
  Loader2,
} from 'lucide-react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';

interface DashboardStats {
  overview: {
    total_users: number;
    active_users: number;
    new_users_today: number;
    ai_requests_today?: number;
    total_ai_requests?: number;
    revenue: { total: number; monthly: number };
  };
  ai_performance: {
    average_response_time: string;
    uptime: string;
    failed_requests_today: number;
  };
  subscriptions: {
    total_subscribers: number;
    active_plans: Array<Record<string, unknown>>;
  };
  recent_activity: Array<{
    user: string;
    action: string;
    time: string;
  }>;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.get(endpoints.adminDashboardStats);
        if (!cancelled) setStats(res.data);
      } catch (e) {
        if (!cancelled) setError('Failed to load dashboard stats.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-page-header">
          <h1>Admin Dashboard</h1>
          <p>Users, activity & revenue</p>
        </div>
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)]" aria-hidden />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-content">
        <div className="admin-page-header">
          <h1>Admin Dashboard</h1>
          <p>Users, activity & revenue</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-center">
          <p className="text-[var(--danger-red)]">{error ?? 'No data'}</p>
        </div>
      </div>
    );
  }

  const { overview, subscriptions, recent_activity } = stats;

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of users, activity and revenue</p>
      </div>

      <div className="group-title">OVERVIEW</div>
      <div className="admin-overview-grid">
        <div className="admin-stat-card admin-stat-card-accent">
          <div className="admin-stat-icon">
            <Users className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="admin-stat-label">Total Users</p>
            <p className="admin-stat-value">{overview.total_users}</p>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card-green">
          <div className="admin-stat-icon">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="admin-stat-label">Active Users</p>
            <p className="admin-stat-value">{overview.active_users}</p>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card-purple">
          <div className="admin-stat-icon">
            <Cpu className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="admin-stat-label">AI Requests</p>
            <p className="admin-stat-value">{overview.total_ai_requests ?? 0}</p>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card-amber">
          <div className="admin-stat-icon">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="admin-stat-label">Revenue</p>
            <p className="admin-stat-value">${Number(overview.revenue?.total ?? 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="group-title">RECENT ACTIVITY</div>
      <div className="admin-section-card admin-recent-activity overflow-hidden">
        <div className="admin-section-card-header">
          <h2 className="admin-section-title">Recent Activity</h2>
        </div>
        <div className="admin-recent-activity-table-wrap">
          <table className="admin-recent-activity-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {(recent_activity?.length ?? 0) > 0 ? (
                recent_activity.map((activity, i) => (
                  <tr key={i}>
                    <td className="font-medium text-[var(--text-primary)]">{activity.user}</td>
                    <td className="text-[var(--text-secondary)]">{activity.action}</td>
                    <td className="text-[var(--text-tertiary)]">{new Date(activity.time).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="admin-recent-activity-empty">No recent activity</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="group-title">SUBSCRIPTIONS</div>
      <div className="admin-card">
        <p className="text-2xl font-bold text-[var(--text-primary)]">{subscriptions?.total_subscribers ?? 0}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Total subscribers</p>
        {Array.isArray(subscriptions?.active_plans) && subscriptions.active_plans.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {subscriptions.active_plans.slice(0, 5).map((plan: Record<string, unknown>, i: number) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                {String(plan.name ?? plan.id ?? 'Plan')}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
