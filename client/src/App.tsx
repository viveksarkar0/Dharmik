import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import CreateTaskPage from './pages/CreateTaskPage';
import AdminPage from './pages/AdminPage';
import StatsPage from './pages/StatsPage';
import useAuth from './hooks/useAuthHook';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated && user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return user.role === 'admin' ? <>{children}</> : <Navigate to="/tasks" replace />;
};

const AppRoutes = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated && user ? <Navigate to="/tasks" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated && user ? <Navigate to="/tasks" replace /> : <RegisterPage />} 
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/new" 
        element={
          <ProtectedRoute>
            <CreateTaskPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/:id" 
        element={
          <ProtectedRoute>
            <TaskDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/stats" 
        element={
          <AdminRoute>
            <StatsPage />
          </AdminRoute>
        } 
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;