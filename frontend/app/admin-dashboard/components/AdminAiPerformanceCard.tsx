'use client';

import React from 'react';
import { Gauge, Activity, AlertCircle } from 'lucide-react';

interface AiPerformance {
  average_response_time: string;
  uptime: string;
  failed_requests_today: number;
}

interface AdminAiPerformanceCardProps {
  aiPerformance?: AiPerformance | null;
}

export default function AdminAiPerformanceCard({ aiPerformance }: AdminAiPerformanceCardProps) {
  if (!aiPerformance) {
    return (
      <div className="admin-section-card flex-1 min-w-0 min-w-[260px] p-6">
        <h2 className="admin-section-title mb-4">AI Performance</h2>
        <p className="text-sm text-[var(--text-secondary)]">No data</p>
      </div>
    );
  }

  const { average_response_time, uptime, failed_requests_today } = aiPerformance;

  return (
    <div className="admin-section-card flex-1 min-w-0 min-w-[260px]">
      <div className="admin-section-card-header">
        <h2 className="admin-section-title">AI Performance</h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-[var(--surface)] p-3">
          <Gauge className="h-5 w-5 text-[var(--accent)] shrink-0" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Avg response time</p>
            <p className="font-semibold text-[var(--text-primary)]">{average_response_time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-[var(--surface)] p-3">
          <Activity className="h-5 w-5 text-[var(--safe-green)] shrink-0" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Uptime</p>
            <p className="font-semibold text-[var(--text-primary)]">{uptime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-[var(--surface)] p-3">
          <AlertCircle className="h-5 w-5 text-[var(--danger-red)] shrink-0" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Failed requests today</p>
            <p className="font-semibold text-[var(--text-primary)]">{failed_requests_today}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
