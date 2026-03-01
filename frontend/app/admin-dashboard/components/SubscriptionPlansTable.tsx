'use client';

import React from 'react';

interface ActivePlan {
  name?: string;
  id?: string | number;
  count?: number;
  [key: string]: unknown;
}

interface SubscriptionPlansTableProps {
  activePlans?: ActivePlan[];
  totalSubscribers?: number;
  embedded?: boolean;
}

export default function SubscriptionPlansTable({
  activePlans = [],
  totalSubscribers = 0,
  embedded = false,
}: SubscriptionPlansTableProps) {
  const plans = Array.isArray(activePlans) ? activePlans : [];

  const wrapperClass = embedded
    ? 'dashboard-usage-panel dashboard-usage-plans'
    : 'admin-section-card flex-1 min-w-0';

  return (
    <div className={wrapperClass}>
      {!embedded && (
        <div className="admin-section-card-header">
          <h2 className="admin-section-title">Subscription Plans</h2>
        </div>
      )}
      {embedded && (
        <h3 className="dashboard-usage-panel-title">Subscription plans</h3>
      )}
      <div className={embedded ? 'dashboard-usage-plans-inner' : 'p-4'}>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{totalSubscribers}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Total subscribers</p>
        {plans.length > 0 ? (
          <div className="dashboard-usage-plans-table-wrap">
            <table className="dashboard-usage-plans-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th className="text-right">Subscribers</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, i) => (
                  <tr key={i}>
                    <td className="font-medium text-[var(--text-primary)]">
                      {String(plan.name ?? plan.id ?? 'Plan')}
                    </td>
                    <td className="text-right text-[var(--text-secondary)] tabular-nums">
                      {typeof plan.count === 'number' ? plan.count : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">No active plans</p>
        )}
      </div>
    </div>
  );
}
