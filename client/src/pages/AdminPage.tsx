// Admin User Management Page
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuthHook';
import type { User } from '../types/task';

interface UserData extends User {
  createdAt: string;
  updatedAt: string;
}

const AdminPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE}/users?${queryParams}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error - please check if the server is running');
    } finally {
      setLoading(false);
    }
  }, [filters, API_BASE]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Trigger fetchUsers when pagination changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, fetchUsers]);

  const updateUserRole = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      setError(''); // Clear previous errors
      const response = await fetch(`${API_BASE}/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the user in the local state instead of refetching all users
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user._id === userId 
                ? { ...user, role: newRole }
                : user
            )
          );
        } else {
          setError(data.message || 'Failed to update user role');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Network error - please check if the server is running');
    }
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the admin panel.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <Link
            to="/tasks"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>
            </div>
            
            <Link
              to="/tasks"
              className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tasks
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Overview
              </h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">{pagination.total}</div>
                  <div className="text-blue-100 text-sm">Total Users</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
                  <div className="text-purple-100 text-sm">Administrators</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">{users.filter(u => u.role === 'member').length}</div>
                  <div className="text-green-100 text-sm">Members</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {/* Search Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
                  <p className="text-gray-600 text-sm">Manage user roles and permissions</p>
                </div>
                <div className="w-full sm:w-auto mt-4 sm:mt-0">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search users by email..."
                      value={filters.search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/90"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center mb-6">
                  <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading users...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Users Table */}
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50/80 backdrop-blur-sm">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/60 backdrop-blur-sm divide-y divide-gray-200">
                        {users.map(userData => (
                          <tr key={userData._id} className="hover:bg-white/80 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                  {userData.firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {userData.firstName} {userData.lastName || ''}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{userData.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                userData.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                  : 'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                                {userData.role === 'admin' ? '👑' : '👤'} {userData.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(userData.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {userData._id !== user.id ? (
                                <select
                                  value={userData.role}
                                  onChange={(e) => updateUserRole(userData._id, e.target.value as 'admin' | 'member')}
                                  className="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/90 text-sm"
                                >
                                  <option value="member">👤 Member</option>
                                  <option value="admin">👑 Admin</option>
                                </select>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  ⭐ Current User
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                        Showing {((pagination.page - 1) * pagination.limit) + 1}-
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>
                        
                        <span className="px-4 py-2 text-sm text-gray-600 bg-white/60 rounded-lg">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Next
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
