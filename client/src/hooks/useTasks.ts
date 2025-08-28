import { useState, useCallback } from 'react';
import type { Task, TaskFilters, TaskStats } from '../types/task';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    statusCounts: {},
    priorityCounts: {},
    overdueCount: 0,
    recentTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE}/tasks?${queryParams}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/stats/overview`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task._id !== taskId));
        await fetchStats(); // Refresh stats after deletion
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }, [fetchStats]);

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(prev => [data.data, ...prev]);
        await fetchStats(); // Refresh stats after creation
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }, [fetchStats]);

  const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(prev => prev.map(task => 
          task._id === taskId ? data.data : task
        ));
        await fetchStats(); // Refresh stats after update
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }, [fetchStats]);

  return {
    tasks,
    stats,
    loading,
    pagination,
    fetchTasks,
    fetchStats,
    deleteTask,
    createTask,
    updateTask
  };
};
