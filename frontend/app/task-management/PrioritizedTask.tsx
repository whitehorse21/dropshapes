'use client';

import React from 'react';

interface TaskReasoning {
  urgency?: string;
  importance?: string;
  time_required?: string;
}

interface PrioritizedTaskItem {
  title: string;
  priority: string;
  due_date?: string;
  reasoning: TaskReasoning;
}

interface PrioritizedTaskProps {
  prioritizedTasks: PrioritizedTaskItem[];
  loading: boolean;
  clearPrioritizedTask: () => void;
}

/* Theme-matched priority badge: subtle background + border, text from theme */
const priorityBadgeStyle: Record<string, React.CSSProperties> = {
  high: { background: 'rgba(255, 76, 76, 0.15)', border: '1px solid var(--danger-red)', color: 'var(--text-primary)' },
  medium: { background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', color: 'var(--text-primary)' },
  low: { background: 'rgba(34, 197, 94, 0.15)', border: '1px solid var(--safe-green)', color: 'var(--text-primary)' },
};

export default function PrioritizedTask({ prioritizedTasks, loading, clearPrioritizedTask }: PrioritizedTaskProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
        <span className="animate-pulse">Loading AI suggestions...</span>
      </div>
    );
  }

  if (!prioritizedTasks?.length) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
        No AI suggestions available.
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            AI-Prioritized Tasks
            <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>({prioritizedTasks.length})</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Prioritized based on urgency, importance, and due dates
          </p>
        </div>
        <button
          type="button"
          className="btn-resume btn-resume-danger"
          onClick={clearPrioritizedTask}
        >
          Clear All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {prioritizedTasks.map((task, index) => (
          <div
            key={index}
            className="tool-pill"
            style={{
              display: 'block',
              textAlign: 'left',
              padding: '16px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                className="prioritized-task-priority-badge"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  ...(priorityBadgeStyle[task.priority] || { background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' }),
                }}
              >
                {task.priority?.toUpperCase() || 'N/A'}
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</h3>
            </div>
            {task.due_date && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Due {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
            {task.reasoning && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {task.reasoning.urgency && <p><strong>Urgency:</strong> {task.reasoning.urgency}</p>}
                {task.reasoning.importance && <p><strong>Importance:</strong> {task.reasoning.importance}</p>}
                {task.reasoning.time_required && <p><strong>Time required:</strong> {task.reasoning.time_required}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
