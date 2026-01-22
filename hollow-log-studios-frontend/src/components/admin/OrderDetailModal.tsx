import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';

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

interface OrderDetailModalProps {
  purchase: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  purchase,
  isOpen,
  onClose
}) => {
  if (!purchase) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shippingInfo = purchase.metadata?.shipping_details;
  const customerInfo = purchase.metadata?.customer_details;
  const lineItems = purchase.metadata?.line_items || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {purchase.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order Date:</span>
                <p>{formatDate(purchase.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <Badge className="ml-2" variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                  {purchase.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Payment ID:</span>
                <p className="text-xs">{purchase.payment_id || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Amount:</span>
                <p className="font-semibold">{formatCurrency(purchase.amount)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-500">Name:</span> {customerInfo?.name || 'N/A'}</p>
              <p><span className="text-gray-500">Email:</span> {customerInfo?.email || purchase.user_id || 'N/A'}</p>
              <p><span className="text-gray-500">Phone:</span> {customerInfo?.phone || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            {shippingInfo ? (
              <div className="text-sm">
                <p className="font-medium">{shippingInfo.name}</p>
                <p>{shippingInfo.address?.line1}</p>
                {shippingInfo.address?.line2 && <p>{shippingInfo.address.line2}</p>}
                <p>{shippingInfo.address?.city}, {shippingInfo.address?.state} {shippingInfo.address?.postal_code}</p>
                <p>{shippingInfo.address?.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No shipping address available</p>
            )}
          </div>

          <Separator />

          {/* Products Ordered */}
          <div>
            <h3 className="font-semibold mb-2">Products Ordered</h3>
            {lineItems.length > 0 ? (
              <div className="space-y-2">
                {lineItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.description || purchase.product_title}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity || purchase.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency((item.amount_total || purchase.amount * 100) / 100)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{purchase.product_title}</p>
                <p className="text-sm text-gray-500">Quantity: {purchase.quantity}</p>
                <p className="font-semibold">{formatCurrency(purchase.amount)}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};