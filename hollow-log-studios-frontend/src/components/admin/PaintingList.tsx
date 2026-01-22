import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PaintingForm } from './PaintingForm';
import { Painting } from '@/types';
import { fetchPaintings, updatePaintingFeatured, deletePainting } from '@/firebase/galleryService';
import { useToast } from '@/hooks/use-toast';

interface PaintingListProps {
  onEdit?: (painting: Painting) => void;
  refreshTrigger?: number;
}

export function PaintingList({ onEdit, refreshTrigger }: PaintingListProps) {
  const { toast } = useToast();
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPainting, setSelectedPainting] = useState<Painting | undefined>(undefined);
  const [featuredCount, setFeaturedCount] = useState(0);

  const loadPaintings = async () => {
    try {
      setLoading(true);
      const data = await fetchPaintings();
      setPaintings(data);
      
      // Count featured paintings
      const featured = data.filter(p => p.featured).length;
      setFeaturedCount(featured);
    } catch (err) {
      console.error('Error loading paintings:', err);
      setError('Failed to load paintings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaintings();
  }, [refreshTrigger]);

  const handleEdit = (painting: Painting) => {
    if (onEdit) {
      onEdit(painting);
    } else {
      setSelectedPainting(painting);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this painting?')) return;

    try {
      await deletePainting(id);

      toast({
        title: 'Success',
        description: 'Painting deleted successfully',
      });

      // Refresh the list
      loadPaintings();
    } catch (err) {
      console.error('Error deleting painting:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete painting',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedPainting(undefined);
    loadPaintings();
  };

  const handleToggleFeatured = async (painting: Painting) => {
    // If we're trying to feature a painting and already have 4 featured paintings
    if (!painting.featured && featuredCount >= 4) {
      toast({
        title: 'Limit Reached',
        description: 'You can only feature up to 4 paintings on the homepage.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const success = await updatePaintingFeatured(painting.id, !painting.featured);
      if (success) {
        // Update the local state
        setPaintings(paintings.map(p => 
          p.id === painting.id ? { ...p, featured: !p.featured } : p
        ));
        
        // Update featured count
        setFeaturedCount(prev => painting.featured ? prev - 1 : prev + 1);
        
        toast({
          title: 'Success',
          description: `Painting ${!painting.featured ? 'added to' : 'removed from'} featured list`,
        });
      }
    } catch (err) {
      console.error('Error updating featured status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update featured status',
        variant: 'destructive',
      });
    }
  };

  // Helper function to display available prices
  const renderPrices = (painting: Painting) => {
    const tagPrices = painting.tag_prices || {};
    const printPrice = tagPrices['Print - For Sale'];
    const originalPrice = tagPrices['Original - For Sale'];

    if (!printPrice && !originalPrice) {
      return <p className="text-gray-700">Price: Not for sale</p>;
    }

    return (
      <div className="text-gray-700">
        <p className="font-medium">Available Prices:</p>
        <ul className="ml-4 list-disc">
          {originalPrice && (
            <li>Original: ${originalPrice.toFixed(2)}</li>
          )}
          {printPrice && (
            <li>Print: ${printPrice.toFixed(2)}</li>
          )}
        </ul>
      </div>
    );
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{selectedPainting ? 'Edit Painting' : 'Add New Painting'}</h2>
          <Button variant="outline" onClick={() => {
            setIsFormOpen(false);
            setSelectedPainting(undefined);
          }}>
            Cancel
          </Button>
        </div>
        <PaintingForm 
          painting={selectedPainting} 
          onSuccess={handleFormSuccess} 
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedPainting(undefined);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <p>Loading paintings...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : paintings.length === 0 ? (
        <p>No paintings found. Add your first painting!</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {paintings.map((painting) => (
            <Card key={painting.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/4 h-48 md:h-auto">
                    <img 
                      src={painting.image_url} 
                      alt={painting.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{painting.title}</h3>
                      <p className="text-gray-600 mb-2 line-clamp-2">{painting.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {painting.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {renderPrices(painting)}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={painting.featured} 
                          onCheckedChange={() => handleToggleFeatured(painting)}
                          id={`featured-${painting.id}`}
                        />
                        <label htmlFor={`featured-${painting.id}`} className="text-sm font-medium">
                          Featured
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(painting)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(painting.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}