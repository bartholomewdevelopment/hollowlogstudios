import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCommissionMessages } from '@/firebase/messageService';
import type { Message } from '@/types/customer-portal';
import { useToast } from '@/hooks/use-toast';
import MessageAttachment from '@/components/MessageAttachment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle } from 'lucide-react';

interface MessageListProps {
  commissionId?: string;
  messages?: Message[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onNewMessage?: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  commissionId, 
  messages: propMessages, 
  isLoading: propLoading,
  onRefresh,
  onNewMessage 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // If messages are provided as props, use those
    if (propMessages !== undefined) {
      setMessages(propMessages);
      setLoading(false);
      return;
    }
    
    // Otherwise fetch messages for a specific commission
    const fetchMessages = async () => {
      if (!commissionId) return;
      
      try {
        setLoading(true);
        const data = await getCommissionMessages(commissionId);
        setMessages(data);
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

    fetchMessages();
  }, [commissionId, propMessages, toast]);

  // Use prop loading state if provided, otherwise use local state
  const isLoading = propLoading !== undefined ? propLoading : loading;

  if (isLoading) {
    return <div className="text-center py-4">Loading messages...</div>;
  }

  if (messages?.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Messages</CardTitle>
          {onNewMessage && (
            <Button onClick={onNewMessage} size="sm" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>New</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">No messages yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Messages</CardTitle>
        {onNewMessage && (
          <Button onClick={onNewMessage} size="sm" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>New</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[400px] w-full pr-4">
          <div className="space-y-4">
            {messages?.map((message) => {
              const isFromUser = message.sender_id !== 'admin';
              
              return (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg ${isFromUser ? 'bg-blue-50 mr-8' : 'bg-gray-50 ml-8'}`}
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {isFromUser ? 'You' : 'Artist'}
                    </span>
                    <span className="text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
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
      </CardContent>
    </Card>
  );
};

export default MessageList;
