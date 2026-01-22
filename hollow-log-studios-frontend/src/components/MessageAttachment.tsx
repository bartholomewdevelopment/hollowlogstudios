import React from 'react';
import { Button } from '@/components/ui/button';
import type { MessageAttachment as MessageAttachmentType } from '@/types/customer-portal';

interface MessageAttachmentProps {
  attachment: MessageAttachmentType;
}

const MessageAttachment: React.FC<MessageAttachmentProps> = ({ attachment }) => {
  const { file_name, file_url, file_type, file_size } = attachment;
  
  const getFileIcon = () => {
    if (file_type?.includes('image')) {
      return '🖼️';
    } else if (file_type?.includes('pdf')) {
      return '📑';
    } else {
      return '📄';
    }
  };
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = file_url;
    a.download = file_name; // Set the filename for download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-gray-50 border border-gray-200">
      <div className="flex items-center">
        <span className="mr-2 text-lg">{getFileIcon()}</span>
        <div>
          <div className="font-medium text-sm truncate max-w-[200px]">{file_name}</div>
          {file_size && (
            <div className="text-xs text-gray-500">{formatFileSize(file_size)}</div>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        {file_type?.includes('image') && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(file_url, '_blank')}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDownload}
          className="text-blue-600 hover:text-blue-800"
        >
          Download
        </Button>
      </div>
    </div>
  );
};

export default MessageAttachment;
