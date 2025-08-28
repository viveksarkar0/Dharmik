import type { TaskStats } from '../types/task';

interface StatsPanelProps {
  stats: TaskStats;
  loading: boolean;
}

const StatsPanel = ({ stats, loading }: StatsPanelProps) => {
  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusPercentage = (count: number) => {
    return stats.totalTasks > 0 ? Math.round((count / stats.totalTasks) * 100) : 0;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Task Overview
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="text-2xl font-bold text-blue-700">{stats.totalTasks}</div>
          <div className="text-sm text-blue-600 font-medium">Total Tasks</div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
          <div className="text-2xl font-bold text-red-700">{stats.overdueCount}</div>
          <div className="text-sm text-red-600 font-medium">Overdue</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          Status Breakdown
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">To Do</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-900">{stats.statusCounts.todo || 0}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {getStatusPercentage(stats.statusCounts.todo || 0)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50/50">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-900">{stats.statusCounts['in-progress'] || 0}</span>
              <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded-full">
                {getStatusPercentage(stats.statusCounts['in-progress'] || 0)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-green-50/50">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Done</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-900">{stats.statusCounts.done || 0}</span>
              <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded-full">
                {getStatusPercentage(stats.statusCounts.done || 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
          Priority Breakdown
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/50">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">High</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{stats.priorityCounts.high || 0}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50/50">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Medium</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{stats.priorityCounts.medium || 0}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg bg-green-50/50">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-700">Low</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{stats.priorityCounts.low || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
