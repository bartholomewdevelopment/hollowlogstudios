import React, { useState } from 'react';
import { format } from 'date-fns';
import { Purchase } from '@/types/customer-portal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import PurchaseDetailModal from './PurchaseDetailModal';

interface PurchaseListProps {
  purchases: Purchase[];
  isLoading: boolean;
}

const PurchaseList: React.FC<PurchaseListProps> = ({ purchases, isLoading }) => {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
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

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            View all your past purchases and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading state
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : purchases.length === 0 ? (
            // Empty state
            <div className="text-center py-8 text-muted-foreground">
              <p>You haven't made any purchases yet.</p>
            </div>
          ) : (
            // Purchase list table
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow 
                      key={purchase.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(purchase)}
                    >
                      <TableCell className="font-medium">
                        {formatDate(purchase.created_at)}
                      </TableCell>
                      <TableCell>{purchase.product_title}</TableCell>
                      <TableCell className="capitalize">
                        {purchase.product_type}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(purchase.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(purchase.status) as any}
                        >
                          {purchase.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PurchaseDetailModal
        purchase={selectedPurchase}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default PurchaseList;
