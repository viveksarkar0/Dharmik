import type { TaskFilters } from '../types/task';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
}

const TaskFiltersComponent = ({ filters, onFiltersChange, onClearFilters }: TaskFiltersProps) => {
  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
      page: 1 // Reset to first page when filters change
    });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Search Bar */}
        <div className="flex-1 min-w-0">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Tasks
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              placeholder="Search tasks..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[140px]">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
            >
              <option value="">All Statuses</option>
              <option value="todo">📋 To Do</option>
              <option value="in-progress">⚡ In Progress</option>
              <option value="done">✅ Done</option>
            </select>
          </div>

          <div className="min-w-[140px]">
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
            >
              <option value="">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          <div className="min-w-[140px]">
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sortBy"
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className="min-w-[120px]">
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              id="sortOrder"
              value={filters.sortOrder || 'desc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm"
            >
              <option value="desc">↓ Newest</option>
              <option value="asc">↑ Oldest</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFiltersComponent;
