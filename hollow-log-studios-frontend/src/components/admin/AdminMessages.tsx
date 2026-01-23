import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAllCommissions } from '@/firebase/commissionService';
import { getCommissionMessages, markMessagesAsRead, sendMessage } from '@/firebase/messageService';
import type { Message, Commission } from '@/types/customer-portal';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageAttachment from '@/components/MessageAttachment';
import { Paperclip } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

interface AdminMessagesProps {
  commissionId?: string;
  refreshTrigger?: number;
}

const AdminMessages: React.FC<AdminMessagesProps> = ({ 
  commissionId,
  refreshTrigger = 0 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [selectedCommission, setSelectedCommission] = useState<string | null>(commissionId || null);
  const [sendingReply, setSendingReply] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch commissions first
  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const data = await getAllCommissions();
        setCommissions(data);
        
        // If commissionId is not provided, select the first commission
        if (!commissionId && data && data.length > 0) {
          setSelectedCommission(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching commissions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load commissions',
          variant: 'destructive',
        });
      }
    };

    fetchCommissions();
  }, [commissionId, refreshTrigger]);

  // Fetch messages when selected commission changes
  useEffect(() => {
    if (selectedCommission) {
      fetchMessages(selectedCommission);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [selectedCommission, refreshTrigger]);

  const fetchMessages = async (commissionId: string) => {
    try {
      setLoading(true);
      const data = await getCommissionMessages(commissionId);
      setMessages(data);

      // Mark unread messages as read
      const unreadMessages = data.filter(m => !m.is_read);
      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(m => m.id);
        await markMessagesAsRead(commissionId, unreadIds);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(prev => [...prev, ...fileArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachFiles = () => {
    fileInputRef.current?.click();
  };

  const handleSendReply = async () => {
    if (!selectedCommission || !replyContent.trim()) return;

    try {
      setSendingReply(true);
      
      // Use sendMessage which handles file attachments
      await sendMessage(
        selectedCommission,
        replyContent,
        files.length > 0 ? files : undefined,
        'admin'
      );
      
      setReplyContent('');
      setFiles([]);
      toast({
        title: 'Reply sent',
        description: 'Your message has been sent successfully',
      });

      // Refresh messages
      fetchMessages(selectedCommission);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Messages</CardTitle>
        <CardDescription>View and respond to customer messages</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Commission selector */}
        {!commissionId && commissions.length > 0 && (
          <div className="mb-4">
            <select
              className="w-full p-2 border rounded-md"
              value={selectedCommission || ''}
              onChange={(e) => setSelectedCommission(e.target.value)}
            >
              <option value="">Select a commission</option>
              {commissions.map((commission) => (
                <option key={commission.id} value={commission.id}>
                  {commission.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Messages display */}
        {loading ? (
          <div className="text-center py-8">Loading messages...</div>
        ) : !selectedCommission ? (
          <div className="text-center py-8 text-gray-500">
            Select a commission to view messages
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages found for this commission
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4 mb-6 p-2">
              {messages.map((message) => {
                const isAdmin = message.sender_id === 'admin'; // Replace with actual admin ID check
                return (
                  <div 
                    key={message.id} 
                    className={`p-3 rounded-lg ${isAdmin ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {isAdmin ? 'You (Admin)' : message.sender?.first_name || 'Customer'}
                      </span>
                      <span className="text-gray-500">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="mt-1">{message.content}</p>
                    
                    {/* Display attachments if any */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map(attachment => (
                          <MessageAttachment key={attachment.id} attachment={attachment} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Reply form */}
        {selectedCommission && (
          <div className="mt-4">
            <Textarea
              placeholder="Type your reply here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[100px] mb-2"
              disabled={sendingReply}
            />
            
            {/* File attachments */}
            <div className="mb-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAttachFiles}
                  disabled={sendingReply}
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attach Files
                </Button>
                <span className="text-sm text-gray-500">
                  {files.length > 0 ? `${files.length} file(s) selected` : ''}
                </span>
              </div>
              
              {/* Show selected files */}
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-1 rounded">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveFile(index)}
                        className="h-6 text-red-500"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleSendReply} 
              disabled={!replyContent.trim() || sendingReply}
            >
              {sendingReply ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminMessages;
