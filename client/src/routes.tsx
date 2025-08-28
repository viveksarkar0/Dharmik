// Main app routes for React Router
import { createBrowserRouter } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import AdminPage from './pages/AdminPage';
import StatsPage from './pages/StatsPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/tasks', element: <TasksPage /> },
  { path: '/tasks/:id', element: <TaskDetailPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '/stats', element: <StatsPage /> },
]);

export default router;
