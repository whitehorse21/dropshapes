"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import apiService from "@/app/apimodule/utils/apiService";
import endpoints from "@/app/apimodule/endpoints/ApiEndpoints";

interface FeatureUsageStats {
  resume_builder: {
    total_resumes_created: number;
    ai_enhanced_resumes: number;
  };
  cover_letter_builder: {
    total_letters_created: number;
    ai_generated_letters: number;
  };
  ai_services: {
    grammar_check: number;
    text_to_speech: number;
    smart_task_management: number;
    interview_prep_sessions: number;
  };
}

const COLORS = [
  "#4c6fff",
  "#a78bfa",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
];

/** Custom tooltip so it’s readable and matches admin theme */
function ChartTooltip(props: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  const { active, payload, label } = props;
  if (!active || !payload?.length || label == null) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="admin-chart-tooltip">
      <div className="admin-chart-tooltip-label">{label}</div>
      <div className="admin-chart-tooltip-value">
        <span className="admin-chart-tooltip-value-num">
          {Number(value).toLocaleString()}
        </span>
        <span className="admin-chart-tooltip-value-unit"> uses</span>
      </div>
    </div>
  );
}

interface AdminFeatureUsageChartProps {
  embedded?: boolean;
}

export default function AdminFeatureUsageChart({
  embedded = false,
}: AdminFeatureUsageChartProps) {
  const [data, setData] = useState<FeatureUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.get(endpoints.adminDashboardFeatureUsage);
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setError("Failed to load feature usage");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const wrapperClass = embedded
    ? "dashboard-usage-panel dashboard-usage-chart"
    : "admin-section-card flex-1 min-w-0";

  if (loading) {
    return (
      <div
        className={`${wrapperClass} flex items-center justify-center min-h-[280px]`}
      >
        <Loader2
          className="h-10 w-10 animate-spin text-[var(--accent)]"
          aria-hidden
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`${wrapperClass} p-6`}>
        {embedded && (
          <h3 className="dashboard-usage-panel-title">Feature usage</h3>
        )}
        {!embedded && (
          <div className="admin-section-card-header">
            <h2 className="admin-section-title">Feature Usage</h2>
          </div>
        )}
        <div className="p-4">
          <p className="text-[var(--danger-red)] text-sm">
            {error ?? "No data"}
          </p>
        </div>
      </div>
    );
  }

  const chartData = [
    {
      name: "Resumes",
      total: data.resume_builder.total_resumes_created,
      ai: data.resume_builder.ai_enhanced_resumes,
    },
    {
      name: "Cover Letters",
      total: data.cover_letter_builder.total_letters_created,
      ai: data.cover_letter_builder.ai_generated_letters,
    },
    { name: "Grammar Check", total: data.ai_services.grammar_check, ai: 0 },
    { name: "Text to Speech", total: data.ai_services.text_to_speech, ai: 0 },
    { name: "Task Mgmt", total: data.ai_services.smart_task_management, ai: 0 },
    {
      name: "Interview Prep",
      total: data.ai_services.interview_prep_sessions,
      ai: 0,
    },
  ];

  const maxVal = Math.max(...chartData.map((d) => d.total + d.ai), 1);

  return (
    <div className={wrapperClass}>
      {!embedded && (
        <div className="admin-section-card-header">
          <h2 className="admin-section-title">Feature Usage</h2>
        </div>
      )}
      {embedded && (
        <h3 className="dashboard-usage-panel-title">Feature usage</h3>
      )}
      <div
        className={embedded ? "dashboard-usage-chart-inner" : "p-4"}
        style={embedded ? undefined : { height: 280 }}
      >
        {chartData.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm p-4">
            No usage data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={embedded ? 260 : 280}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 12, right: 24, left: 88, bottom: 12 }}
              barCategoryGap={12}
              barGap={4}
            >
              <XAxis type="number" domain={[0, maxVal]} hide />
              <YAxis
                type="category"
                dataKey="name"
                width={84}
                tick={{
                  fontSize: 12,
                  fill: "var(--text-secondary)",
                  fontFamily: "inherit",
                }}
                axisLine={{ stroke: "var(--glass-border)" }}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar
                dataKey="total"
                name="Usage"
                radius={[0, 6, 6, 0]}
                maxBarSize={28}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
