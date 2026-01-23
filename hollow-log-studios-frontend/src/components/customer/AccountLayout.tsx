import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/account', label: 'Overview', end: true },
  { to: '/account/orders', label: 'Orders' },
  { to: '/account/payments', label: 'Payments' },
  { to: '/account/commissions', label: 'Commissions' },
  { to: '/account/addresses', label: 'Addresses' },
];

const AccountLayout: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-green-600">Account</p>
              <p className="mt-2 text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-green-100 text-green-800 font-semibold'
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-800',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Button
              variant="outline"
              className="mt-6 w-full border-green-200 text-green-800 hover:bg-green-50"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </aside>
          <main className="min-h-[400px]">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountLayout;
