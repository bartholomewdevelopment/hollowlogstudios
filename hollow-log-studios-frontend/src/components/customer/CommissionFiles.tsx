import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { uploadMultipleFiles } from '@/firebase/uploadService';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { formatDate } from '@/utils/formatDate';

interface CommissionFile {
  id: string;
  commission_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

interface CommissionFilesProps {
  commissionId: string;
}

const CommissionFiles: React.FC<CommissionFilesProps> = ({ commissionId }) => {
  const [files, setFiles] = useState<CommissionFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (commissionId) {
      fetchFiles();
    }
  }, [commissionId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const filesQuery = query(
        collection(db, 'commission_files'),
        where('commission_id', '==', commissionId),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(filesQuery);
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommissionFile[];
      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
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
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const userId = auth.currentUser?.uid;

      if (!userId) {
        throw new Error('You must be logged in to upload files');
      }

      const fileUrls = await uploadMultipleFiles(selectedFiles, 'customer-files', `commission-${commissionId}`);

      for (let i = 0; i < fileUrls.length; i++) {
        await addDoc(collection(db, 'commission_files'), {
          commission_id: commissionId,
          file_url: fileUrls[i],
          file_name: selectedFiles[i].name,
          file_type: selectedFiles[i].type,
          file_size: selectedFiles[i].size,
          uploaded_by: userId,
          created_at: serverTimestamp()
        });
      }

      setSelectedFiles([]);
      toast({
        title: 'Files uploaded',
        description: `Successfully uploaded ${fileUrls.length} file(s)`,
      });
      fetchFiles();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Input
            ref={fileInputRef}
            id="fileUpload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
            accept="image/jpeg,image/png,image/gif,application/pdf"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Select Files
          </Button>
          <span className="text-xs text-gray-500">
            Max 10MB per file. Supported formats: JPEG, PNG, GIF, PDF
          </span>
        </div>

        {selectedFiles.length > 0 && (
          <div className="border rounded-md p-2 space-y-2 mb-2">
            {selectedFiles.map((file, index) => (
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
                  onClick={() => removeSelectedFile(index)}
                  disabled={uploading}
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button
              onClick={handleUploadFiles}
              disabled={selectedFiles.length === 0 || uploading}
              className="mt-2"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No files found for this commission
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>
                      {file.file_type?.includes('image') ? '🖼️' :
                       file.file_type?.includes('pdf') ? '📑' : '📄'}
                    </span>
                    <div>
                      <div className="font-medium">{file.file_name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.file_size / 1024).toFixed(1)} KB •
                        {formatDate(file.created_at)}
                      </div>
                    </div>
                  </div>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default CommissionFiles;
