import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Commission } from '@/types/customer-portal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getCommissionMessages, sendMessage } from '@/firebase/messageService';
import MessageAttachment from '@/components/MessageAttachment';
import type { Message } from '@/types/customer-portal';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/utils/formatDate';

interface CommissionDetailProps {
  commission: Commission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommissionDetail: React.FC<CommissionDetailProps> = ({
  commission,
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (activeTab === 'messages' && commission.id) {
      fetchMessages();
    }
  }, [activeTab, commission.id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getCommissionMessages(commission.id);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Validate file types
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      const newFiles = Array.from(e.target.files).filter(file => {
        if (!validTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not supported. Only JPEG, PNG, GIF, and PDF are allowed.`,
            variant: "destructive"
          });
          return false;
        }
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 10MB limit.`,
            variant: "destructive"
          });
          return false;
        }
        
        return true;
      });
      
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() && files.length === 0) return;

    try {
      setSendingReply(true);
      await sendMessage(
        commission.id,
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
      fetchMessages();
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Title</h3>
                <p>{commission.title}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Description</h3>
                <p>{commission.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Type</h3>
                  <p>{commission.type || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Size</h3>
                  <p>{commission.size || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Budget</h3>
                  <p>{commission.budget || 'Not specified'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Deadline</h3>
                  <p>{commission.deadline || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p>{commission.status}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Payment Status</h3>
                  <p>{commission.payment_status}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Contact Information</h3>
                <p>{commission.contact_email || 'No email provided'}</p>
                {commission.contact_name && <p>{commission.contact_name}</p>}
                {commission.contact_phone && <p>{commission.contact_phone}</p>}
                {(commission.contact_address_line1 ||
                  commission.contact_city ||
                  commission.contact_state ||
                  commission.contact_postal_code ||
                  commission.contact_country) && (
                  <div className="text-sm text-gray-600">
                    {commission.contact_address_line1 && <p>{commission.contact_address_line1}</p>}
                    {commission.contact_address_line2 && <p>{commission.contact_address_line2}</p>}
                    <p>
                      {[commission.contact_city, commission.contact_state, commission.contact_postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {commission.contact_country && <p>{commission.contact_country}</p>}
                  </div>
                )}
                {commission.contact_preferred_method && (
                  <p className="text-sm text-gray-600">
                    Preferred: {commission.contact_preferred_method}
                  </p>
                )}
                {commission.contact_best_time && (
                  <p className="text-sm text-gray-600">
                    Best time: {commission.contact_best_time}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium">Created</h3>
                <p>{formatDate(commission.created_at)}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-4">
            <div className="space-y-4">
              {/* Messages display */}
              {loading ? (
                <div className="text-center py-4">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No messages found for this commission
                </div>
              ) : (
                <ScrollArea className="h-[40vh] pr-4">
                  <div className="space-y-4 mb-4 p-2">
                    {messages.map((message) => {
                      const isAdmin = message.sender_id === 'admin';
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
              <div className="mt-2">
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[100px] mb-2"
                  disabled={sendingReply}
                />
                
                {/* File attachment section */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      ref={fileInputRef}
                      id="attachments"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={sendingReply}
                      accept="image/jpeg,image/png,image/gif,application/pdf"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sendingReply}
                    >
                      Attach Files
                    </Button>
                    <span className="text-xs text-gray-500">
                      Max 10MB per file. Supported formats: JPEG, PNG, GIF, PDF
                    </span>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="border rounded-md p-2 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <span className="mr-2">
                              {file.type.includes('image') ? '🖼️' : 
                              file.type.includes('pdf') ? '📑' : '📄'}
                            </span>
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFile(index)}
                            disabled={sendingReply}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={handleSendReply} 
                    disabled={(replyContent.trim() === '' && files.length === 0) || sendingReply}
                  >
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CommissionDetail;
