import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getAllCommissions, updateCommissionStatus } from '@/firebase/commissionService';
import { Commission } from '@/types/customer-portal';
import { useToast } from '@/hooks/use-toast';
import CommissionDetail from './CommissionDetail';
import { formatDate } from '@/utils/formatDate';

interface CommissionRequestsProps {
  refreshTrigger?: number;
}

const CommissionRequests: React.FC<CommissionRequestsProps> = ({ 
  refreshTrigger = 0
}) => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setLoading(true);
        const data = await getAllCommissions();
        setCommissions(data);
      } catch (error) {
        console.error('Error fetching commissions:', error);
        toast({
          title: 'Error',
          description: 'Could not load commission requests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, [toast, refreshTrigger]);

  const handleStatusChange = async (id: string, status: Commission['status']) => {
    try {
      await updateCommissionStatus(id, status);
      setCommissions(commissions.map(comm => 
        comm.id === id ? { ...comm, status } : comm
      ));
      toast({
        title: 'Status updated',
        description: `Commission status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: Commission['status']) => {
    switch (status) {
      case 'Not Started':
        return <Badge variant="outline">Not Started</Badge>;
      case 'In Progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'Complete':
        return <Badge>Complete</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewDetails = (commission: Commission) => {
    setSelectedCommission(commission);
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading commission requests...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Commission Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-center py-4">No commission requests found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">{commission.title}</TableCell>
                    <TableCell>{commission.type || 'Not specified'}</TableCell>
                    <TableCell>
                      {commission.contact_email || commission.user_id || 'Unknown'}
                      {commission.contact_name && <div className="text-xs">{commission.contact_name}</div>}
                    </TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                    <TableCell>{formatDate(commission.created_at, { dateStyle: 'short' })}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(commission)}
                        >
                          View Details
                        </Button>
                        {commission.status === 'Not Started' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(commission.id, 'In Progress')}
                          >
                            Start
                          </Button>
                        )}
                        {commission.status === 'In Progress' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(commission.id, 'Complete')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedCommission && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <CommissionDetail 
              commission={selectedCommission} 
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CommissionRequests;
