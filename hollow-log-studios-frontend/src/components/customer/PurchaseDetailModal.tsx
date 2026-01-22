import React from 'react';
import { format } from 'date-fns';
import { Purchase } from '@/types/customer-portal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PurchaseDetailModalProps {
  purchase: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
  purchase,
  isOpen,
  onClose,
}) => {
  if (!purchase) return null;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy h:mm a');
  };

  // Get badge color based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Extract metadata information if available
  const metadata = purchase.metadata || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Details</DialogTitle>
          <DialogDescription>
            Details for your purchase on {formatDate(purchase.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Product</h3>
            <span className="text-right">{purchase.product_title}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Type</h3>
            <span className="capitalize">{purchase.product_type}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Date</h3>
            <span>{formatDate(purchase.created_at)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Amount</h3>
            <span className="font-semibold">{formatCurrency(purchase.amount)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Quantity</h3>
            <span>{purchase.quantity}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Status</h3>
            <Badge variant={getStatusBadgeVariant(purchase.status) as any}>
              {purchase.status}
            </Badge>
          </div>
          
          {purchase.payment_id && (
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Payment ID</h3>
              <span className="text-xs font-mono bg-muted p-1 rounded">
                {purchase.payment_id}
              </span>
            </div>
          )}
          
          {Object.keys(metadata).length > 0 && (
            <>
              <Separator />
              <h3 className="font-medium">Additional Information</h3>
              <div className="text-sm space-y-2 bg-muted p-3 rounded-md">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDetailModal;
