import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PurchaseList from '@/components/customer/PurchaseList';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPurchases } from '@/firebase/purchaseService';
import type { Purchase } from '@/types/customer-portal';

const AccountPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const loadPurchases = async () => {
      try {
        setLoading(true);
        const data = await getUserPurchases(user.email);
        setPurchases(data);
      } catch (error) {
        console.error('Error loading payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [user?.email]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-600">
          Invoices and paid history for your purchases.
        </p>
      </div>
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          Invoice emails are sent after checkout. If you need a copy, reply in your
          commission messages or contact support.
        </CardContent>
      </Card>
      <PurchaseList purchases={purchases} isLoading={loading} />
    </div>
  );
};

export default AccountPaymentsPage;
