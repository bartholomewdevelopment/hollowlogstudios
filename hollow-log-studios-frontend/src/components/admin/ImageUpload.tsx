import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadFile } from '@/lib/uploadHelpers';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  onImageUploaded?: (url: string) => void;
  currentImageUrl?: string;
  value?: string;
  onChange?: (value: string) => void;
  bucket?: string;
}

export function ImageUpload({
  onUploadComplete,
  onImageUploaded,
  currentImageUrl,
  value,
  onChange,
  bucket = 'paintings'
}: ImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);
      setError(null);

      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Upload to Firebase Storage
      const publicUrl = await uploadFile(file, bucket);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Call all callbacks if provided
      if (onUploadComplete) onUploadComplete(publicUrl);
      if (onImageUploaded) onImageUploaded(publicUrl);
      if (onChange) onChange(publicUrl);

      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully."
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Error uploading image. Please try again.');

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Error uploading image. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const retryUpload = () => {
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      {(value || currentImageUrl) && (
        <div className="mb-2">
          <img
            src={value || currentImageUrl}
            alt="Uploaded image"
            className="h-32 w-auto object-contain rounded border"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="flex-1"
        />
      </div>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-2">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={retryUpload}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
