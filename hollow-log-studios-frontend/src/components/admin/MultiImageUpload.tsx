import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { X, Plus } from 'lucide-react';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: string;
  maxImages?: number;
  label?: string;
}

export function MultiImageUpload({
  value = [],
  onChange,
  bucket,
  maxImages = 5,
  label = 'Images'
}: MultiImageUploadProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleImageChange = (url: string, index: number) => {
    const newUrls = [...value];
    newUrls[index] = url;
    onChange(newUrls);
    setUploadingIndex(null);
  };

  const addImageSlot = () => {
    if (value.length < maxImages) {
      onChange([...value, '']);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {value.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageSlot}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Image {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeImage(index)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ImageUpload
              value={url}
              onChange={(newUrl) => handleImageChange(newUrl, index)}
              bucket={bucket}
            />
          </div>
        ))}
      </div>
      
      {value.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-2">No images added yet</p>
          <Button
            type="button"
            variant="outline"
            onClick={addImageSlot}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Image
          </Button>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        You can add up to {maxImages} images for the gallery carousel.
      </p>
    </div>
  );
}