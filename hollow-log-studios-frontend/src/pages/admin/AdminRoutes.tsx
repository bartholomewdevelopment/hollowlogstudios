import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminRoutes() {
  const { user, loading } = useAuth();

  // Use the user from AuthContext to determine admin status
  const isAdmin = user?.is_admin === true;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If we're authenticated and admin, show admin content
  // Otherwise redirect to login
  if (user && isAdmin) {
    console.log('Admin user authenticated:', user.email);
  }

  return (
    <Routes>
      <Route path="login" element={isAdmin ? <Navigate to="/admin" replace /> : <LoginPage />} />
      <Route path="/*" element={isAdmin ? <DashboardPage /> : <Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
