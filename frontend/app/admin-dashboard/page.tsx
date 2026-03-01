'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Cpu,
  DollarSign,
  Loader2,
  LayoutDashboard,
  BarChart3,
} from 'lucide-react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';
import AdminFeatureUsageChart from './components/AdminFeatureUsageChart';
import SubscriptionPlansTable from './components/SubscriptionPlansTable';
import AdminAiPerformanceCard from './components/AdminAiPerformanceCard';

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
          <p>Overview of users, activity and revenue</p>
        </div>
        <section className="admin-section-card">
          <div className="admin-section-card-body">
            <div className="admin-section-loading-cell" style={{ margin: 0, padding: '48px 24px' }}>
              <Loader2 className="admin-section-spinner" aria-hidden />
              <span>Loading dashboard…</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-content">
        <div className="admin-page-header">
          <h1>Admin Dashboard</h1>
          <p>Overview of users, activity and revenue</p>
        </div>
        <section className="admin-section-card">
          <div className="admin-section-card-body">
            <div className="admin-section-empty-cell">
              <p className="text-[var(--danger-red)]">{error ?? 'No data'}</p>
              <span>Failed to load dashboard stats</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const { overview, subscriptions, recent_activity, ai_performance } = stats;

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of users, activity and revenue</p>
      </div>

      <section className="admin-section-card" aria-labelledby="dashboard-overview-heading">
        <div className="admin-section-card-header">
          <LayoutDashboard className="admin-section-card-icon" aria-hidden />
          <h2 id="dashboard-overview-heading" className="admin-section-card-title" style={{ marginBottom: 0 }}>
            Overview
          </h2>
          <p className="admin-section-card-desc">Key metrics at a glance.</p>
        </div>
        <div className="admin-section-card-body">
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
        </div>
      </section>

      <section className="admin-section-card" aria-labelledby="dashboard-usage-heading">
        <div className="admin-section-card-header">
          <BarChart3 className="admin-section-card-icon" aria-hidden />
          <h2 id="dashboard-usage-heading" className="admin-section-card-title" style={{ marginBottom: 0 }}>
            Feature usage & subscriptions
          </h2>
          <p className="admin-section-card-desc">Usage by feature and active plans.</p>
        </div>
        <div className="admin-section-card-body">
          <div className="dashboard-usage-grid">
            <AdminFeatureUsageChart embedded />
            <SubscriptionPlansTable
              embedded
              activePlans={subscriptions?.active_plans}
              totalSubscribers={subscriptions?.total_subscribers ?? 0}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 w-full">
        <div className="admin-section-card admin-recent-activity overflow-hidden flex-1 min-w-0">
          <div className="admin-section-card-header">
            <h2 className="admin-section-card-title" style={{ marginBottom: 0 }}>Recent activity</h2>
            <p className="admin-section-card-desc">Latest user actions.</p>
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
        <AdminAiPerformanceCard aiPerformance={ai_performance} />
      </div>
    </div>
  );
}
