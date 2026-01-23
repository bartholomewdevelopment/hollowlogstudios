import React, { useEffect, useState } from 'react';
import PurchaseList from '@/components/customer/PurchaseList';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPurchases } from '@/firebase/purchaseService';
import type { Purchase } from '@/types/customer-portal';

const AccountOrdersPage: React.FC = () => {
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
        console.error('Error loading purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [user?.email]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-600">
          Review your purchases for books, merch, and paintings.
        </p>
      </div>
      <PurchaseList purchases={purchases} isLoading={loading} />
    </div>
  );
};

export default AccountOrdersPage;
