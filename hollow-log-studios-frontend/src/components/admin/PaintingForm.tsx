import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from './ImageUpload';
import { TagSelector } from './TagSelector';
import { TagPriceInput } from './TagPriceInput';
import { createPainting, updatePainting } from '@/firebase/galleryService';
import { Painting } from '@/types';

interface PaintingFormProps {
  painting?: Painting;
  onSuccess: () => void;
  onCancel: () => void;
}

// Tags that require price inputs
const PRICE_TAGS = ['Print - For Sale', 'Original - For Sale'];

export function PaintingForm({ painting, onSuccess, onCancel }: PaintingFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(painting?.title || '');
  const [description, setDescription] = useState(painting?.description || '');
  const [imageUrl, setImageUrl] = useState(painting?.image_url || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(painting?.tags || []);
  const [tagPrices, setTagPrices] = useState<Record<string, number>>(painting?.tag_prices || {});
  const [featured, setFeatured] = useState(painting?.featured || false);
  const [showcase, setShowcase] = useState(painting?.showcase || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter selected tags that need price inputs
  const selectedPriceTags = selectedTags.filter(tag => PRICE_TAGS.includes(tag));

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const handleTagChange = (tags: string[]) => {
    setSelectedTags(tags);

    // Clean up tagPrices for removed tags
    const updatedPrices = { ...tagPrices };
    Object.keys(updatedPrices).forEach(tag => {
      if (!tags.includes(tag)) {
        delete updatedPrices[tag];
      }
    });
    setTagPrices(updatedPrices);
  };

  const handleTagPriceChange = (tag: string, price: number | undefined) => {
    const updatedPrices = { ...tagPrices };
    if (price === undefined) {
      delete updatedPrices[tag];
    } else {
      updatedPrices[tag] = price;
    }
    setTagPrices(updatedPrices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !imageUrl || selectedTags.length === 0) {
      toast({
        title: 'Missing fields',
        description: 'Please fill all required fields and select at least one tag.',
        variant: 'destructive',
      });
      return;
    }

    // Check if prices are provided for tags that need them
    const missingPrices = selectedPriceTags.filter(tag => tagPrices[tag] === undefined);
    if (missingPrices.length > 0) {
      toast({
        title: 'Missing prices',
        description: `Please provide prices for: ${missingPrices.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const paintingData = {
        title,
        description,
        image_url: imageUrl,
        tags: selectedTags,
        tag_prices: tagPrices,
        featured,
        showcase,
      };

      if (painting?.id) {
        // Update existing painting
        await updatePainting(painting.id, paintingData);
      } else {
        // Insert new painting
        await createPainting(paintingData);
      }

      toast({
        title: 'Success',
        description: `Painting ${painting ? 'updated' : 'added'} successfully!`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving painting:', error);
      toast({
        title: 'Error',
        description: 'Failed to save painting. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Painting title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description || ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the painting"
          rows={4}
        />
      </div>

      <TagSelector
        selectedTags={selectedTags}
        onChange={handleTagChange}
      />

      {selectedPriceTags.length > 0 && (
        <div className="space-y-4">
          <Label>Tag-specific Prices</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPriceTags.map(tag => (
              <TagPriceInput
                key={tag}
                tag={tag}
                price={tagPrices[tag]}
                onChange={handleTagPriceChange}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="featured"
          checked={featured}
          onCheckedChange={setFeatured}
        />
        <Label htmlFor="featured">Featured on Homepage</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="showcase"
          checked={showcase}
          onCheckedChange={setShowcase}
        />
        <Label htmlFor="showcase">Available for Showcase</Label>
      </div>

      <div className="space-y-2">
        <Label>Image *</Label>
        {imageUrl ? (
          <div className="space-y-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="max-h-64 rounded-md object-contain"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageUrl('')}
            >
              Change Image
            </Button>
          </div>
        ) : (
          <ImageUpload onUploadComplete={handleImageUpload} />
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : painting ? 'Update Painting' : 'Add Painting'}
        </Button>
      </div>
    </form>
  );
}
