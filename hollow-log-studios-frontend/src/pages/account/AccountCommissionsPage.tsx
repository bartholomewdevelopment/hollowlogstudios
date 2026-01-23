import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getCommissionsByContactEmail } from '@/firebase/commissionService';
import type { Commission } from '@/types/customer-portal';
import MessageList from '@/components/customer/MessageList';
import MessageForm from '@/components/customer/MessageForm';

const statusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in progress':
      return 'secondary';
    case 'review':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const AccountCommissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageRefreshKey, setMessageRefreshKey] = useState(0);

  useEffect(() => {
    if (!user?.email) return;

    const loadCommissions = async () => {
      try {
        setLoading(true);
        const data = await getCommissionsByContactEmail(user.email);
        setCommissions(data);
        if (!selectedId && data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (error) {
        console.error('Error loading commissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCommissions();
  }, [user?.email]);

  const selectedCommission = useMemo(
    () => commissions.find((commission) => commission.id === selectedId) || null,
    [commissions, selectedId]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Commissions</h1>
        <p className="text-sm text-gray-600">
          Track your active commission requests and message Bethany directly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg">Your Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading commissions...</p>
            ) : commissions.length === 0 ? (
              <p className="text-sm text-gray-500">No commission requests yet.</p>
            ) : (
              commissions.map((commission) => (
                <button
                  key={commission.id}
                  onClick={() => setSelectedId(commission.id)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                    commission.id === selectedId
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {commission.title || commission.type || 'Commission'}
                    </span>
                    <Badge variant={statusColor(commission.status) as any}>
                      {commission.status || 'Not Started'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {commission.description || 'No description provided.'}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!selectedCommission ? (
            <Card className="border-green-100">
              <CardContent className="p-6 text-sm text-gray-600">
                Select a commission to view details and messages.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg">Commission Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <Badge variant={statusColor(selectedCommission.status) as any}>
                      {selectedCommission.status || 'Not Started'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Type</span>
                    <span>{selectedCommission.type || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Budget</span>
                    <span>{selectedCommission.budget || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Deadline</span>
                    <span>{selectedCommission.deadline || 'Not specified'}</span>
                  </div>
                  <div className="pt-2 text-sm text-gray-600">
                    {selectedCommission.description || 'No description provided.'}
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="messages" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
                <TabsContent value="messages" className="mt-4 space-y-4">
                  <MessageList
                    commissionId={selectedCommission.id}
                    refreshTrigger={messageRefreshKey}
                  />
                  <Card className="border-green-100">
                    <CardContent className="p-4">
                      <MessageForm
                        commissionId={selectedCommission.id}
                        onMessageSent={() =>
                          setMessageRefreshKey((prev) => prev + 1)
                        }
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="summary" className="mt-4">
                  <Card className="border-green-100">
                    <CardContent className="p-4 text-sm text-gray-600 space-y-3">
                      <p>
                        Need to adjust details? Send a message and we will follow up with
                        next steps.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountCommissionsPage;
