import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AccountLoginPage from './AccountLoginPage';
import AccountDashboardPage from './AccountDashboardPage';
import AccountOrdersPage from './AccountOrdersPage';
import AccountPaymentsPage from './AccountPaymentsPage';
import AccountCommissionsPage from './AccountCommissionsPage';
import AccountAddressesPage from './AccountAddressesPage';
import AccountLayout from '@/components/customer/AccountLayout';

const AccountRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="login" element={user ? <Navigate to="/account" replace /> : <AccountLoginPage />} />
      <Route element={user ? <AccountLayout /> : <Navigate to="/account/login" replace />}>
        <Route index element={<AccountDashboardPage />} />
        <Route path="orders" element={<AccountOrdersPage />} />
        <Route path="payments" element={<AccountPaymentsPage />} />
        <Route path="commissions" element={<AccountCommissionsPage />} />
        <Route path="addresses" element={<AccountAddressesPage />} />
      </Route>
    </Routes>
  );
};

export default AccountRoutes;
