export interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: 'admin' | 'member';
  id: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags: string[];
  createdBy: User;
  assignee?: User;
  activityLog: Array<{
    action: string;
    timestamp: Date;
    user: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TaskStats {
  totalTasks: number;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  overdueCount: number;
  recentTasks: Task[];
}

// Re-export for better compatibility
export type { User as UserType, Task as TaskType, TaskFilters as TaskFiltersType, TaskStats as TaskStatsType };
