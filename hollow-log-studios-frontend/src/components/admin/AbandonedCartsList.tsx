import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAbandonedCarts } from '@/firebase/cartService';
import { formatCurrency } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AbandonedCart {
  id: string;
  user_id?: string;
  cart_items: any[];
  total_price: number;
  created_at: string;
  updated_at: string;
  last_activity: string;
  is_converted: boolean;
  session_id?: string;
  user_email?: string;
  user_name?: string;
}

export const AbandonedCartsList: React.FC = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        setLoading(true);
        const data = await getAbandonedCarts();
        setCarts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching abandoned carts:', err);
        setError('Failed to load abandoned carts');
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
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

  const handleViewDetails = (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setIsDetailsOpen(true);
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
          {carts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No abandoned carts found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carts.map((cart) => (
                  <TableRow key={cart.id}>
                    <TableCell>{formatDate(cart.created_at)}</TableCell>
                    <TableCell>{cart.cart_items.length} items</TableCell>
                    <TableCell>{formatCurrency(cart.total_price)}</TableCell>
                    <TableCell>{formatDate(cart.last_activity)}</TableCell>
                    <TableCell>
                      {cart.user_name || cart.user_email || (
                        <Badge variant="outline">Anonymous</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(cart)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cart Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Cart Details</DialogTitle>
          </DialogHeader>
          
          {selectedCart && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p>{formatDate(selectedCart.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Activity</h3>
                  <p>{formatDate(selectedCart.last_activity)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <p>{selectedCart.user_name || selectedCart.user_email || 'Anonymous'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Session ID</h3>
                  <p className="text-xs text-gray-500 truncate">{selectedCart.session_id}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Cart Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCart.cart_items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                          {item.variant && (
                            <Badge variant="secondary" className="ml-2">{item.variant}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                      <TableCell className="font-bold">{formatCurrency(selectedCart.total_price)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
