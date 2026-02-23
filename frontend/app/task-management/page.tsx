'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthWrapper from '@/app/components/AuthWrapper';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import { toast } from 'react-hot-toast';
import AddTaskModal, { TaskData } from '@/app/components/modals/AddTaskModal';
import PrioritizedTask from './PrioritizedTask';

type SubMenu = 'tasks' | 'quick' | 'prioritize';

interface Task {
  id: number;
  title: string;
  description?: string;
  priority?: string;
  status: string;
  due_date?: string | null;
  category?: string;
  created_at?: string;
}

const initialTaskData: TaskData = {
  title: '',
  description: '',
  priority: '',
  status: 'pending',
  due_date: null,
  category: '',
};

function TaskManagementContent() {
  const router = useRouter();
  const [subMenu, setSubMenu] = useState<SubMenu>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [quickEntry, setQuickEntry] = useState('');
  const [quickEntryLoading, setQuickEntryLoading] = useState(false);
  const [prioritizeLoading, setPrioritizeLoading] = useState(false);
  const [prioritizedTasks, setPrioritizedTasks] = useState<Array<{ title: string; priority: string; due_date?: string; reasoning: { urgency?: string; importance?: string; time_required?: string } }>>([]);
  const [taskData, setTaskData] = useState<TaskData>(initialTaskData);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('tasks/');
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.tasks || [];
      setTasks(list);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({
      ...prev,
      [name]: name === 'due_date' ? (value || null) : value,
    }));
  };

  const handleEditTask = (task: Task) => {
    setTaskData({
      title: task.title,
      description: task.description || '',
      priority: task.priority || '',
      status: task.status,
      due_date: task.due_date || null,
      category: task.category || '',
    });
    setEditTaskId(task.id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleQuickTaskEntry = async () => {
    if (!quickEntry.trim()) return;
    setQuickEntryLoading(true);
    try {
      await axiosInstance.post('tasks/quick-entry/', { task_input: quickEntry });
      toast.success('Task added successfully!');
      loadTasks();
      setQuickEntry('');
    } catch (err: unknown) {
      console.error('Quick entry error:', err);
      const detail = err && typeof err === 'object' && 'response' in err && err.response && typeof (err.response as { data?: { detail?: string } }).data?.detail === 'string'
        ? (err.response as { data: { detail: string } }).data.detail
        : 'Failed to save task. Try again!';
      toast.error(detail);
    } finally {
      setQuickEntryLoading(false);
    }
  };

  const toggleTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      await axiosInstance.put(`tasks/${taskId}`, {
        task: { ...task, status: newStatus },
      });
      toast.success(`Task "${task.title}" marked as ${newStatus}!`);
      loadTasks();
    } catch (err) {
      console.error('Toggle task error:', err);
      toast.error('Failed to update task.');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await axiosInstance.delete(`tasks/${taskId}`);
      toast.success('Task deleted!');
      loadTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handlePrioritizeTasks = async () => {
    setPrioritizeLoading(true);
    setPrioritizedTasks([]);
    try {
      const res = await axiosInstance.get('tasks/prioritization-suggestions');
      const data = res.data;
      const suggestions = data?.prioritization_suggestions || [];
      setPrioritizedTasks(suggestions);
    } catch (err) {
      console.error('Prioritize error:', err);
      toast.error('Failed to get prioritization suggestions.');
    } finally {
      setPrioritizeLoading(false);
    }
  };

  const filteredTasks = [...(tasks || [])]
    .sort((a, b) => new Date((b.created_at || 0) as string).getTime() - new Date((a.created_at || 0) as string).getTime())
    .filter((task) => {
      const isCompleted = task.status === 'completed';
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && isCompleted) ||
        (filter === 'pending' && !isCompleted) ||
        filter === task.priority ||
        filter === task.category;
      const matchesSearch =
        !searchTerm ||
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status !== 'completed').length,
    high: tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length,
  };

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const openAddTask = () => {
    setTaskData(initialTaskData);
    setEditTaskId(null);
    setIsEditing(false);
    setShowAddForm(true);
  };

  return (
    <section id="view-task-management" className="view-section active-view" aria-label="Task Management">
      <div className="task-management-page">
        <div className="header-minimal">
          <h1>Smart Task Management</h1>
          <p>AI-powered task prioritization and productivity</p>
        </div>

        <div className="task-management-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/')} aria-label="Back to Home">
            ← Back to Home
          </button>
        </div>

        <nav className="task-management-subnav" aria-label="Task management sections">
          <button
            type="button"
            className={`task-management-subnav-btn ${subMenu === 'tasks' ? 'active' : ''}`}
            onClick={() => setSubMenu('tasks')}
          >
            My Tasks
          </button>
          <button
            type="button"
            className={`task-management-subnav-btn ${subMenu === 'quick' ? 'active' : ''}`}
            onClick={() => setSubMenu('quick')}
          >
            Quick Entry
          </button>
          <button
            type="button"
            className={`task-management-subnav-btn ${subMenu === 'prioritize' ? 'active' : ''}`}
            onClick={() => setSubMenu('prioritize')}
          >
            AI Prioritize
          </button>
        </nav>

        {subMenu === 'tasks' && (
          <>
            <div className="task-management-stats">
              <div className="task-management-stat">
                <span className="task-management-stat-value" style={{ color: 'var(--accent)' }}>{taskStats.total}</span>
                <span className="task-management-stat-label">Total</span>
              </div>
              <div className="task-management-stat">
                <span className="task-management-stat-value" style={{ color: 'var(--safe-green)' }}>{taskStats.completed}</span>
                <span className="task-management-stat-label">Done</span>
              </div>
              <div className="task-management-stat">
                <span className="task-management-stat-value" style={{ color: 'var(--warning)' }}>{taskStats.pending}</span>
                <span className="task-management-stat-label">Pending</span>
              </div>
              <div className="task-management-stat">
                <span className="task-management-stat-value" style={{ color: 'var(--danger-red)' }}>{taskStats.high}</span>
                <span className="task-management-stat-label">High</span>
              </div>
            </div>

            <div className="task-management-card">
              <div className="task-management-actions">
                <button type="button" className="btn-resume btn-resume-primary" onClick={openAddTask}>
                  Add Task
                </button>
                <button
                  type="button"
                  className="btn-resume"
                  onClick={handlePrioritizeTasks}
                  disabled={isLoading}
                >
                  {prioritizeLoading ? 'Loading...' : 'AI Prioritize'}
                </button>
              </div>
              <div className="task-management-filter-row">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="auth-input"
                  aria-label="Search tasks"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="auth-input"
                  aria-label="Filter tasks"
                  style={{ minWidth: '140px' }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="task-management-card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
                Your Tasks ({filteredTasks.length})
              </h2>
              {isLoading ? (
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Loading tasks...</p>
              ) : filteredTasks.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No tasks yet. Add one or use Quick Entry.</p>
              ) : (
                <div className="task-management-task-list">
                  {filteredTasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    const priorityConfig = priorities.find((p) => p.value === task.priority);
                    return (
                      <div
                        key={task.id}
                        className={`task-management-task-item ${isCompleted ? 'completed' : ''}`}
                      >
                        <div className="task-row">
                          <button
                            type="button"
                            className="task-toggle"
                            onClick={() => toggleTask(task.id)}
                            aria-label={isCompleted ? 'Mark pending' : 'Mark completed'}
                          >
                            {isCompleted ? '✓' : '○'}
                          </button>
                          <div className="task-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <h3 style={{ fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none', color: 'var(--text-primary)', margin: 0, fontSize: '1rem' }}>
                                {task.title}
                              </h3>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="button" className="btn-resume" style={{ padding: '4px 10px', fontSize: '0.85rem' }} onClick={() => handleEditTask(task)}>Edit</button>
                                <button type="button" className="btn-resume" style={{ padding: '4px 10px', fontSize: '0.85rem', color: 'var(--danger-red)' }} onClick={() => deleteTask(task.id)}>Delete</button>
                              </div>
                            </div>
                            {task.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{task.description}</p>}
                            <div className="task-meta">
                              {priorityConfig && <span>{priorityConfig.label}</span>}
                              <span>{task.status}</span>
                              {task.category && <span>{task.category}</span>}
                              {task.due_date && <span>Due {new Date(task.due_date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {subMenu === 'quick' && (
          <div className="task-management-card task-management-quick-entry-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Quick Entry</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Type a short description and we&apos;ll create a task for you.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'stretch' }}>
              <input
                type="text"
                value={quickEntry}
                onChange={(e) => setQuickEntry(e.target.value)}
                placeholder="e.g. Buy groceries tomorrow"
                className="auth-input"
                style={{ flex: 1, minWidth: '200px' }}
                onKeyDown={(e) => e.key === 'Enter' && quickEntry.trim() && !quickEntryLoading && handleQuickTaskEntry()}
                aria-label="Quick task description"
              />
              <button
                type="button"
                className="btn-resume btn-resume-primary"
                onClick={handleQuickTaskEntry}
                disabled={quickEntryLoading || !quickEntry.trim()}
              >
                {quickEntryLoading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button type="button" className="btn-resume" onClick={openAddTask}>
                Add full task (title, due date, priority)
              </button>
            </div>
          </div>
        )}

        {subMenu === 'prioritize' && (
          <div className="task-management-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>AI Prioritize</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Get AI suggestions for what to focus on based on your tasks.
            </p>
            {prioritizedTasks.length > 0 ? (
              <PrioritizedTask
                prioritizedTasks={prioritizedTasks}
                loading={prioritizeLoading}
                clearPrioritizedTask={() => { setPrioritizedTasks([]); loadTasks(); }}
              />
            ) : (
              <>
                <button
                  type="button"
                  className="btn-resume btn-resume-primary"
                  onClick={handlePrioritizeTasks}
                  disabled={isLoading || tasks.length === 0}
                >
                  {prioritizeLoading ? 'Loading suggestions...' : 'Get AI suggestions'}
                </button>
                {tasks.length === 0 && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Add some tasks first to get prioritization suggestions.</p>
                )}
              </>
            )}
          </div>
        )}

        {showAddForm && (
          <AddTaskModal
            isOpen={showAddForm}
            onClose={() => { setShowAddForm(false); setTaskData(initialTaskData); setEditTaskId(null); setIsEditing(false); }}
            taskData={taskData}
            handleTaskChange={handleTaskChange}
            isEditing={isEditing}
            editTaskId={editTaskId}
            loadTasks={loadTasks}
            setTaskData={setTaskData}
            setEditTaskId={setEditTaskId}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
    </section>
  );
}

export default function TaskManagementPage() {
  return (
    <AuthWrapper>
      <TaskManagementContent />
    </AuthWrapper>
  );
}
