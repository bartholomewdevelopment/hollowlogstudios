import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { getAllPurchases } from '@/firebase/purchaseService';
import { formatCurrency } from '@/lib/utils';
import { OrderDetailModal } from './OrderDetailModal';

interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  product_type: string;
  product_title: string;
  amount: number;
  quantity: number;
  status: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export const OrderHistoryList: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const data = await getAllPurchases();
        setPurchases(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError('Failed to load purchase history');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrder = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPurchase(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500 py-4">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          {purchases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No purchase history found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{formatDate(purchase.created_at)}</TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <p>{purchase.product_title}</p>
                        <p className="text-xs text-gray-500">Qty: {purchase.quantity}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{purchase.metadata?.customer_details?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">
                          {purchase.metadata?.customer_details?.email || purchase.user_id || 'Anonymous'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(purchase)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <OrderDetailModal
        purchase={selectedPurchase}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};