import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendMessage } from '@/firebase/messageService';
import { useToast } from '@/hooks/use-toast';
import { Paperclip, X } from 'lucide-react';

interface MessageFormProps {
  commissionId: string;
  onMessageSent?: () => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ commissionId, onMessageSent }) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && files.length === 0) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message or attach a file',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSending(true);
      // Pass the commissionId directly without any casting
      await sendMessage(commissionId, content, files.length > 0 ? files : undefined);
      
      setContent('');
      setFiles([]);
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully',
      });
      
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Validate file types and sizes
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

  const handleAttachFiles = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Type your message here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[100px]"
        disabled={sending}
      />
      
      {/* File attachments */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/jpeg,image/png,image/gif,application/pdf"
        />
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleAttachFiles}
            disabled={sending}
          >
            <Paperclip className="h-4 w-4 mr-1" />
            Attach Files
          </Button>
          <span className="text-sm text-gray-500">
            {files.length > 0 ? `${files.length} file(s) selected` : ''}
          </span>
        </div>
      </div>
      
      {/* Show selected files */}
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
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
                variant="ghost" 
                size="sm" 
                onClick={() => handleRemoveFile(index)}
                className="h-6 text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <Button type="submit" disabled={sending || (!content.trim() && files.length === 0)}>
        {sending ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};

export default MessageForm;
