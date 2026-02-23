'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Activity,
  Target,
  Award,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import apiService from '@/app/apimodule/utils/apiService';
import endpoints from '@/app/apimodule/endpoints/ApiEndpoints';

interface Task {
  id: number;
  title: string;
  status: string;
  category?: string;
  priority?: string;
  created_at?: string;
  completed_at?: string | null;
}

interface TrendDay {
  day: string;
  usage: number;
  label?: string;
}

interface ServiceBreakdown {
  service: string;
  usage: number;
  color: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BREAKDOWN_COLORS = [
  'var(--accent)',
  'var(--safe-green)',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
];

function getEfficiencyColor(score: number): string {
  if (score >= 80) return 'var(--safe-green)';
  if (score >= 60) return '#eab308';
  return 'var(--danger-red)';
}

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fileCount, setFileCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('dropshapes_files');
    if (saved) {
      try {
        const files = JSON.parse(saved);
        setFileCount(Array.isArray(files) ? files.length : 0);
      } catch {
        setFileCount(0);
      }
    }
  }, []);

  const loadTasks = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiService.get(endpoints.tasksList);
      const data = res?.data;
      const list = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray(data.tasks) ? data.tasks : []);
      setTasks(list);
    } catch (err) {
      setTasks([]);
      setError('Could not load task data. You can try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    const cat = t.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const totalCat = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const serviceBreakdown: ServiceBreakdown[] = Object.entries(categoryCounts)
    .map(([service, count], i) => ({
      service,
      usage: totalCat > 0 ? Math.round((count / totalCat) * 100) : 0,
      color: BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length],
    }))
    .sort((a, b) => b.usage - a.usage);

  const trendsData: TrendDay[] = (() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    return DAYS.map((day, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      d.setDate(d.getDate() + mondayOffset + i);
      const next = new Date(d.getTime());
      next.setDate(next.getDate() + 1);
      const count = tasks.filter((t) => {
        if (!t.created_at) return false;
        const created = new Date(t.created_at).getTime();
        return created >= d.getTime() && created < next.getTime();
      }).length;
      return { day, usage: count, label: `${count}` };
    });
  })();

  const maxTrend = Math.max(1, ...trendsData.map((d) => d.usage));
  const trendBars = trendsData.map((d) => ({
    ...d,
    pct: maxTrend > 0 ? (d.usage / maxTrend) * 100 : 0,
  }));

  const previousWeekTotal = 28;
  const currentWeekTotal = trendsData.reduce((a, d) => a + d.usage, 0);
  const trendChange =
    previousWeekTotal > 0
      ? (((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100).toFixed(1)
      : '0';
  const trendPositive = Number(trendChange) >= 0;

  const recommendations: string[] = [];
  if (completionRate < 50 && totalTasks > 0) {
    recommendations.push('Focus on completing a few tasks to boost your completion rate.');
  } else if (completionRate >= 80) {
    recommendations.push('Your task completion rate is strong — keep it up!');
  }
  if (pendingTasks > completedTasks && totalTasks > 2) {
    recommendations.push('You have several pending tasks — try tackling the highest priority first.');
  }
  if (Object.keys(categoryCounts).length <= 1 && totalTasks > 0) {
    recommendations.push('Try using categories to organize your tasks.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Add more tasks to see personalized insights and trends.');
  }

  return (
    <section
      id="view-analytics"
      className="view-section active-view"
      aria-label="Analytics"
    >
      <div className="analytics-page-wrap">
        <div className="header-minimal analytics-title-block">
          <h1>
            <span className="header-hello">Analytic</span>
            <span className="header-name">s</span>
          </h1>
          <p>Usage insights and productivity overview</p>
        </div>

        <div className="analytics-toolbar">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setTimeframe(period)}
              className={`analytics-timeframe-btn ${timeframe === period ? 'active' : ''}`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="analytics-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={loadTasks} className="analytics-retry-btn">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="analytics-loading">
            <div className="analytics-loading-spinner" aria-hidden />
            <p>Loading analytics…</p>
          </div>
        ) : (
          <>
            <div className="analytics-grid">
              <div className="card stat-card analytics-stat-total">
                <div className="stat-card-inner">
                  <Activity className="stat-card-icon" aria-hidden />
                  <span className="stat-label">Total tasks</span>
                </div>
                <div className="stat-value">{totalTasks}</div>
                <div className="stat-trend positive">All time</div>
              </div>
              <div className="card stat-card analytics-stat-done">
                <div className="stat-card-inner">
                  <CheckCircle2 className="stat-card-icon" aria-hidden />
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-value">{completedTasks}</div>
                <div className="stat-trend positive">This period</div>
              </div>
              <div className="card stat-card analytics-stat-score">
                <div className="stat-card-inner">
                  <Target className="stat-card-icon" aria-hidden />
                  <span className="stat-label">Completion rate</span>
                </div>
                <div
                  className="stat-value"
                  style={{ color: getEfficiencyColor(completionRate) }}
                >
                  {completionRate}%
                </div>
                <div className="stat-trend positive">Efficiency</div>
              </div>
              <div className="card stat-card analytics-stat-top">
                <div className="stat-card-inner">
                  <Award className="stat-card-icon" aria-hidden />
                  <span className="stat-label">Saved files</span>
                </div>
                <div className="stat-value">{fileCount}</div>
                <div className="stat-trend positive">Local</div>
              </div>
            </div>

            <div className="card chart-container analytics-chart-card">
              <div className="chart-header">Usage trend</div>
              <div className="chart-subtitle">
                Tasks created per day this week
                <span
                  className={`analytics-trend-badge ${trendPositive ? 'positive' : 'negative'}`}
                >
                  <TrendingUp
                    className={trendPositive ? '' : 'analytics-trend-icon-down'}
                    aria-hidden
                  />
                  {Math.abs(Number(trendChange))}% vs last week
                </span>
              </div>
              <div className="bar-chart">
                {trendBars.map((col, i) => (
                  <div key={col.day} className="bar-col">
                    <div
                      className="bar-visual"
                      style={{ '--h': `${col.pct}%` } as React.CSSProperties}
                    />
                    <span className="bar-label">{col.day}</span>
                    <span className="bar-value">{col.usage}</span>
                  </div>
                ))}
              </div>
            </div>

            {serviceBreakdown.length > 0 && (
              <div className="card analytics-breakdown-card">
                <h3 className="analytics-breakdown-title">Tasks by category</h3>
                <div className="analytics-breakdown-list">
                  {serviceBreakdown.map((item, index) => (
                    <div key={item.service} className="analytics-breakdown-row">
                      <span className="analytics-breakdown-label">{item.service}</span>
                      <div className="analytics-breakdown-track">
                        <div
                          className="analytics-breakdown-fill"
                          style={{
                            width: `${item.usage}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                      <span className="analytics-breakdown-pct">{item.usage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card analytics-recommendations">
              <div className="analytics-recommendations-header">
                <Clock className="analytics-recommendations-icon" aria-hidden />
                <span>Recommendations</span>
              </div>
              <ul className="analytics-recommendations-list">
                {recommendations.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
