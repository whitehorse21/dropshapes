'use client';

import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import { toast } from 'react-hot-toast';

const PRIORITY_OPTIONS = [
  { value: '', label: 'Select priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export interface TaskData {
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string | null;
  category: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskData: TaskData;
  handleTaskChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isEditing: boolean;
  editTaskId: number | null;
  loadTasks: () => Promise<void>;
  setTaskData: React.Dispatch<React.SetStateAction<TaskData>>;
  setEditTaskId: (id: number | null) => void;
  setIsEditing: (v: boolean) => void;
}

const initialTaskData: TaskData = {
  title: '',
  description: '',
  priority: '',
  status: 'pending',
  due_date: null,
  category: '',
};

export default function AddTaskModal({
  isOpen,
  onClose,
  taskData,
  handleTaskChange,
  isEditing,
  editTaskId,
  loadTasks,
  setTaskData,
  setEditTaskId,
  setIsEditing,
}: AddTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!priorityOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setPriorityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [priorityOpen]);

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const task = {
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: taskData.status,
      due_date: taskData.due_date || null,
      category: taskData.category || 'general',
    };

    try {
      setLoading(true);
      if (isEditing && editTaskId) {
        const res = await axiosInstance.put(`tasks/${editTaskId}`, { task });
        if (res.data) {
          toast.success(`Task "${task.title}" updated successfully!`);
          loadTasks();
          setTaskData(initialTaskData);
          setEditTaskId(null);
          setIsEditing(false);
        }
      } else {
        const res = await axiosInstance.post('tasks/', task);
        if (res.data) {
          toast.success(`Task "${task.title}" added successfully!`);
          loadTasks();
          setTaskData(initialTaskData);
        }
      }
      onClose();
    } catch (err) {
      console.error('Task save error:', err);
      toast.error('Failed to save task. Try again!');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`add-task-modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        className="add-task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="add-task-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>

        <h2 id="add-task-title" className="add-task-modal-title">
          {isEditing ? 'Edit Task' : 'Add New Task'}
        </h2>

        <form onSubmit={handleSubmitTask}>
          <div className="add-task-form-row">
            <label htmlFor="add-task-title-input" className="form-label">Title</label>
            <input
              id="add-task-title-input"
              type="text"
              name="title"
              value={taskData.title}
              onChange={handleTaskChange}
              placeholder="Enter task title"
              className="auth-input"
              required
            />
          </div>
          <div className="add-task-form-row">
            <label htmlFor="add-task-description" className="form-label">Description</label>
            <textarea
              id="add-task-description"
              name="description"
              value={taskData.description}
              onChange={handleTaskChange}
              placeholder="Enter task description (optional)"
              className="auth-input"
              rows={3}
            />
          </div>
          <div className="add-task-form-row" ref={priorityRef}>
            <label id="add-task-priority-label" className="form-label">Priority</label>
            <div className="add-task-priority-select">
              <button
                type="button"
                id="add-task-priority"
                className="add-task-priority-trigger auth-input"
                onClick={() => setPriorityOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={priorityOpen}
                aria-labelledby="add-task-priority-label"
              >
                <span>{PRIORITY_OPTIONS.find((o) => o.value === taskData.priority)?.label ?? 'Select priority'}</span>
                <svg className="add-task-priority-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {priorityOpen && (
                <ul
                  className="add-task-priority-dropdown"
                  role="listbox"
                  aria-labelledby="add-task-priority-label"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <li
                      key={opt.value || 'empty'}
                      role="option"
                      aria-selected={taskData.priority === opt.value}
                      className="add-task-priority-option"
                      onClick={() => {
                        handleTaskChange({ target: { name: 'priority', value: opt.value } } as React.ChangeEvent<HTMLSelectElement>);
                        setPriorityOpen(false);
                      }}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="add-task-form-row">
            <label htmlFor="add-task-category" className="form-label">Category</label>
            <input
              id="add-task-category"
              type="text"
              name="category"
              value={taskData.category}
              onChange={handleTaskChange}
              placeholder="e.g. work, personal"
              className="auth-input"
            />
          </div>
          <div className="add-task-form-row">
            <label htmlFor="add-task-due" className="form-label">Due date</label>
            <input
              id="add-task-due"
              type="date"
              name="due_date"
              value={taskData.due_date || ''}
              onChange={handleTaskChange}
              className="auth-input add-task-date-input"
            />
          </div>
          <div className="add-task-actions">
            <button type="button" className="btn-resume" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-resume btn-resume-primary" disabled={loading}>
              {loading ? 'Saving…' : isEditing ? 'Update' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
