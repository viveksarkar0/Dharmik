import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuthHook';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import StatsPanel from '../components/StatsPanel';
import Pagination from '../components/Pagination';
import type { TaskFilters as TaskFiltersType } from '../types/task';

const TasksPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { 
    tasks, 
    stats, 
    loading, 
    pagination, 
    fetchTasks, 
    fetchStats, 
    deleteTask 
  } = useTasks();

  const [filters, setFilters] = useState<TaskFiltersType>({
    status: '',
    priority: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    if (user) {
      fetchTasks(filters);
      fetchStats();
    }
  }, [filters, user, fetchTasks, fetchStats]);

  const handleFiltersChange = (newFilters: TaskFiltersType) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    const success = await deleteTask(taskId);
    if (success) {
      // Task list and stats will be automatically updated by the hook
      console.log('Task deleted successfully');
    }
  };

  const [tasksError] = useState('');

  if (!user) {
    return (
      <div className="auth-required">
        <p>Please log in to view tasks.</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  TaskFlow
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Welcome back, {user.firstName}!</p>
                  <p className="text-xs text-gray-500">Let's get things done</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  {user.role}
                </span>
                <button 
                  onClick={logout} 
                  className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <StatsPanel stats={stats} loading={loading} />
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link 
                    to="/tasks/new" 
                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Task
                  </Link>
                  {user.role === 'admin' && (
                    <>
                      <Link 
                        to="/admin" 
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white/80 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transform hover:scale-105 transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </Link>
                      <Link 
                        to="/stats" 
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white/80 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transform hover:scale-105 transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analytics
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-6">
              <TaskFilters 
                filters={filters} 
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />

              {tasksError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {tasksError}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-16 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your tasks...</p>
                    <p className="text-gray-400 text-sm mt-1">This won't take long</p>
                  </div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No tasks found</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {Object.values(filters).some(v => v) 
                        ? 'Try adjusting your filters or create a new task to get started.'
                        : 'Ready to boost your productivity? Create your first task and start achieving your goals!'
                      }
                    </p>
                    <Link 
                      to="/tasks/new" 
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Your First Task
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      currentUser={user}
                    />
                  ))}
                </div>
              )}

              {!loading && tasks.length > 0 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
