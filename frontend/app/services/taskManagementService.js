/**
 * Task Management Service
 * ======================
 * Frontend service for AI-powered task management
 * - Task CRUD operations with offline support
 * - AI-powered task prioritization
 * - Productivity analytics
 * - Smart task suggestions
 * - Local storage with cloud sync
 */

import axios from '../apimodule/axiosConfig/Axios';
import { toast } from 'react-hot-toast';
import { BehaviorSubject } from 'rxjs';
import axiosInstance from '../apimodule/axiosConfig/Axios';

class TaskManagementService {
  constructor() {
    this.tasks = [];
    this.taskIdCounter = 0;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.syncPending = false;

    // Observables for reactive state management
    this.tasksSubject = new BehaviorSubject([]);
    this.syncStatusSubject = new BehaviorSubject('synced');

    // Only initialize browser-specific features on client side
    if (typeof window !== 'undefined') {
      // Initialize from localStorage
      this.loadTasksFromStorage();
      
      // Setup online/offline listeners
      this.setupNetworkListeners();
      
      // Auto-sync every 5 minutes when online
      this.startAutoSync();
    }
  }

  /**
   * Get observable for tasks
   */
  getTasks$() {
    return this.tasksSubject.asObservable();
  }

  /**
   * Get observable for sync status
   */
  getSyncStatus$() {
    return this.syncStatusSubject.asObservable();
  }

  /**
   * Add a new task
   * @param {object} task - Task object
   * @returns {Promise<object>} Created task
   */
  async addTask(task) {
    try {
      this.taskIdCounter++;
      const newTask = {
        id: this.taskIdCounter,
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date || null,
        category: task.category || 'general',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        local_id: this.taskIdCounter, // For offline support
        sync_status: 'pending' // pending, synced, failed
      };

      this.tasks.push(newTask);
      this.saveTasksToStorage();
      this.tasksSubject.next([...this.tasks]);

      // Try to sync with server if online
      if (this.isOnline) {
        try {
          const response = await axios.post('/api/tasks/tasks/', {
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
            status: newTask.status,
            due_date: newTask.due_date,
            category: newTask.category
          });

          if (response.data.task) {
            // Update with server ID
            newTask.id = response.data.task.id;
            newTask.sync_status = 'synced';
            this.saveTasksToStorage();
            this.tasksSubject.next([...this.tasks]);
          }
        } catch (error) {
          console.error('Failed to sync task with server:', error);
          newTask.sync_status = 'failed';
          this.syncStatusSubject.next('failed');
        }
      }

      toast.success('Task added successfully');
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
      throw error;
    }
  }

  /**
   * Update a task
   * @param {number} taskId - Task ID
   * @param {object} updates - Task updates
   * @returns {Promise<object>} Updated task
   */
  async updateTask(taskId, updates) {
    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId || t.local_id === taskId);
      console.log("tasks ", this.tasks);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const updatedTask = {
        ...this.tasks[taskIndex],
        ...updates,
        updated_at: new Date().toISOString(),
        sync_status: 'pending'
      };

      this.tasks[taskIndex] = updatedTask;
      this.saveTasksToStorage();
      this.tasksSubject.next([...this.tasks]);

      // Try to sync with server if online
      if (this.isOnline && updatedTask.sync_status !== 'failed') {
        try {
          const response = await axiosInstance.put(`/tasks/tasks/${updatedTask.id}`, updates);
          if (response.data.task) {
            updatedTask.sync_status = 'synced';
            this.saveTasksToStorage();
            this.tasksSubject.next([...this.tasks]);
          }
        } catch (error) {
          console.error('Failed to sync task update with server:', error);
          updatedTask.sync_status = 'failed';
          this.syncStatusSubject.next('failed');
        }
      }

      toast.success('Task updated successfully');
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  }

  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTask(taskId) {
    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId || t.local_id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const task = this.tasks[taskIndex];
      this.tasks.splice(taskIndex, 1);
      this.saveTasksToStorage();
      this.tasksSubject.next([...this.tasks]);

      // Try to sync deletion with server if online
      if (this.isOnline && task.sync_status === 'synced') {
        try {
          await axiosInstance.delete(`/tasks/tasks/${task.id}`);
        } catch (error) {
          console.error('Failed to sync task deletion with server:', error);
          // Keep local deletion but mark sync as failed
          this.syncStatusSubject.next('failed');
        }
      }

      toast.success('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  }

  /**
   * Get all tasks
   * @returns {Array} Array of tasks
   */
  getAllTasks() {
    return [...this.tasks];
  }

  /**
   * Get task by ID
   * @param {number} taskId - Task ID
   * @returns {object|null} Task object or null
   */
  getTaskById(taskId) {
    return this.tasks.find(t => t.id === taskId || t.local_id === taskId) || null;
  }

  /**
   * Filter tasks by criteria
   * @param {object} criteria - Filter criteria
   * @returns {Array} Filtered tasks
   */
  filterTasks(criteria = {}) {
    return this.tasks.filter(task => {
      if (criteria.status && task.status !== criteria.status) return false;
      if (criteria.priority && task.priority !== criteria.priority) return false;
      if (criteria.category && task.category !== criteria.category) return false;
      if (criteria.search) {
        const search = criteria.search.toLowerCase();
        if (!task.title.toLowerCase().includes(search) && 
            !task.description.toLowerCase().includes(search)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Get AI-powered task prioritization suggestions
   * @param {Array} tasks - Tasks to prioritize (optional)
   * @returns {Promise<object>} Prioritization suggestions
   */
  async getTaskPrioritization(tasks = null) {
    try {
      const tasksToAnalyze = tasks || this.tasks;
      
      if (tasksToAnalyze.length === 0) {
        return { suggestion: 'No tasks available for prioritization' };
      }

      const response = await axios.post('/api/tasks/tasks/', {
        tasks: tasksToAnalyze.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
          category: task.category,
          status: task.status
        }))
      });

      return response.data;
    } catch (error) {
      console.error('Error getting task prioritization:', error);
      toast.error('Failed to get prioritization suggestions');
      throw error;
    }
  }

  /**
   * Get AI-generated task suggestions
   * @param {string} context - User context for suggestions
   * @returns {Promise<object>} Task suggestions
   */
  async getTaskSuggestions(context = '') {
    try {
      const response = await axios.post('/api/tasks/tasks/', {
        user_context: context
      });

      return response.data;
    } catch (error) {
      console.error('Error getting task suggestions:', error);
      toast.error('Failed to get task suggestions');
      throw error;
    }
  }

  /**
   * Get productivity analytics
   * @returns {Promise<object>} Analytics data
   */
  async getProductivityAnalytics() {
    try {
      // Local analytics
      const localAnalytics = this.calculateLocalAnalytics();

      // Try to get AI-powered analytics if online
      if (this.isOnline) {
        try {
          const response = await axios.get('/api/tasks/tasks/');
          return {
            ...localAnalytics,
            aiAnalysis: response.data
          };
        } catch (error) {
          console.error('Failed to get AI analytics:', error);
          return localAnalytics;
        }
      }

      return localAnalytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate local analytics
   * @returns {object} Local analytics data
   */
  calculateLocalAnalytics() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = this.tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = this.tasks.filter(t => t.status === 'in_progress').length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Category breakdown
    const categories = {};
    this.tasks.forEach(task => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });

    // Priority breakdown
    const priorities = {};
    this.tasks.forEach(task => {
      priorities[task.priority] = (priorities[task.priority] || 0) + 1;
    });

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionRate: Math.round(completionRate * 10) / 10,
      categories,
      priorities,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Sync tasks with server
   * @returns {Promise<boolean>} Sync success status
   */
  async syncTasks() {
    if (!this.isOnline) {
      this.syncStatusSubject.next('offline');
      return false;
    }

    this.syncPending = true;
    this.syncStatusSubject.next('syncing');

    try {
      // Get server tasks
      const response = await axiosInstance.get('/api/tasks/tasks/');
      const serverTasks = response.data.tasks || [];

      // Merge local and server tasks (server takes precedence for synced items)
      const mergedTasks = [...this.tasks];
      
      // Update sync status for successfully synced tasks
      serverTasks.forEach(serverTask => {
        const localIndex = mergedTasks.findIndex(t => t.id === serverTask.id);
        if (localIndex !== -1) {
          mergedTasks[localIndex] = {
            ...serverTask,
            sync_status: 'synced'
          };
        } else {
          // New task from server
          mergedTasks.push({
            ...serverTask,
            local_id: ++this.taskIdCounter,
            sync_status: 'synced'
          });
        }
      });

      this.tasks = mergedTasks;
      this.saveTasksToStorage();
      this.tasksSubject.next([...this.tasks]);
      this.syncStatusSubject.next('synced');
      
      toast.success('Tasks synchronized successfully');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatusSubject.next('failed');
      toast.error('Failed to synchronize tasks');
      return false;
    } finally {
      this.syncPending = false;
    }
  }

  /**
   * Setup network listeners
   */
  setupNetworkListeners() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncStatusSubject.next('online');
      if (!this.syncPending) {
        this.syncTasks();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.syncStatusSubject.next('offline');
    });
  }

  /**
   * Start auto-sync timer
   */
  startAutoSync() {
    setInterval(() => {
      if (this.isOnline && !this.syncPending) {
        this.syncTasks();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Load tasks from localStorage
   */
  loadTasksFromStorage() {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('dropshapes_tasks');
      if (stored) {
        const data = JSON.parse(stored);
        this.tasks = data.tasks || [];
        this.taskIdCounter = data.taskIdCounter || 0;
        this.tasksSubject.next([...this.tasks]);
      }
    } catch (error) {
      console.error('Failed to load tasks from storage:', error);
    }
  }

  /**
   * Save tasks to localStorage
   */
  saveTasksToStorage() {
    try {
      localStorage.setItem('dropshapes_tasks', JSON.stringify({
        tasks: this.tasks,
        taskIdCounter: this.taskIdCounter,
        lastSaved: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save tasks to storage:', error);
    }
  }

  /**
   * Clear all tasks
   */
  clearAllTasks() {
    this.tasks = [];
    this.taskIdCounter = 0;
    this.saveTasksToStorage();
    this.tasksSubject.next([]);
    toast.success('All tasks cleared');
  }

  /**
   * Export tasks to JSON
   * @returns {string} JSON string of tasks
   */
  exportTasks() {
    return JSON.stringify({
      tasks: this.tasks,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  /**
   * Import tasks from JSON
   * @param {string} jsonData - JSON string of tasks
   * @returns {boolean} Import success status
   */
  importTasks(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks && Array.isArray(data.tasks)) {
        this.tasks = data.tasks.map(task => ({
          ...task,
          sync_status: 'pending' // Mark for sync
        }));
        this.saveTasksToStorage();
        this.tasksSubject.next([...this.tasks]);
        toast.success(`Imported ${data.tasks.length} tasks`);
        return true;
      }
      throw new Error('Invalid task data format');
    } catch (error) {
      console.error('Failed to import tasks:', error);
      toast.error('Failed to import tasks');
      return false;
    }
  }
}

// Export singleton instance
// eslint-disable-next-line import/no-anonymous-default-export
export default new TaskManagementService();
