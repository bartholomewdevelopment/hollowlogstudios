import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPurchases } from '@/firebase/purchaseService';
import { getCommissionsByContactEmail } from '@/firebase/commissionService';
import { getUserAddresses } from '@/firebase/addressService';

const AccountDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [commissionCount, setCommissionCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);

  useEffect(() => {
    if (!user?.email || !user?.id) return;

    const loadOverview = async () => {
      try {
        setLoading(true);
        const [purchases, commissions, addresses] = await Promise.all([
          getUserPurchases(user.email),
          getCommissionsByContactEmail(user.email),
          getUserAddresses(user.id),
        ]);
        setPurchaseCount(purchases.length);
        setCommissionCount(commissions.length);
        setAddressCount(addresses.length);
      } catch (error) {
        console.error('Error loading account overview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [user?.email, user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-600">
          Track your orders, commissions, and saved addresses in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-900">
              {loading ? '—' : purchaseCount}
            </p>
            <p className="text-xs text-gray-500">Merch, books, and paintings</p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-900">
              {loading ? '—' : commissionCount}
            </p>
            <p className="text-xs text-gray-500">Active and completed requests</p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-green-900">
              {loading ? '—' : addressCount}
            </p>
            <p className="text-xs text-gray-500">Saved delivery locations</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle>Next steps</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          Use the navigation on the left to view your full purchase history, manage
          saved addresses, and message Bethany about your commissions.
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDashboardPage;
