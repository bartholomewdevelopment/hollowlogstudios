import React, { useState, useEffect } from 'react';
import { Merchandise } from '@/types';
import { getMerchandise, deleteMerchandise } from '@/firebase/merchandiseService';
import { MerchandiseForm } from './MerchandiseForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function MerchandiseList() {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Merchandise | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const loadMerchandise = async () => {
    try {
      const data = await getMerchandise();
      setMerchandise(data);
    } catch (error) {
      console.error('Error loading merchandise:', error);
      toast({ 
        title: 'Error loading merchandise', 
        description: 'Please try refreshing the page',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchandise();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item? This will also delete all associated images.')) {
      return;
    }

    setDeleting(id);
    try {
      const success = await deleteMerchandise(id);
      if (success) {
        toast({ title: 'Item deleted successfully' });
        await loadMerchandise();
      } else {
        toast({ 
          title: 'Failed to delete item', 
          description: 'Please try again or check the console for errors',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({ 
        title: 'Error deleting item', 
        description: 'An unexpected error occurred',
        variant: 'destructive' 
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(undefined);
    loadMerchandise();
  };

  if (loading) return <div>Loading...</div>;

  if (showForm) {
    return (
      <MerchandiseForm
        merchandise={editingItem}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(undefined);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Merchandise</h2>
        <Button onClick={() => setShowForm(true)}>Add New Item</Button>
      </div>

      <div className="grid gap-4">
        {merchandise.map((item) => {
          const primaryImage = item.primary_image;
          const mainImage = item.merchandise_images?.find(img => img.is_main);
          const displayImage = primaryImage || mainImage?.image_url;
          
          return (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    {item.featured && <Badge variant="secondary">Featured</Badge>}
                    <Badge variant={item.in_stock ? "default" : "destructive"}>
                      {item.in_stock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>
                {displayImage && (
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={displayImage} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                
                {/* Display available sizes if they exist */}
                {(item as any).available_sizes && (item as any).available_sizes.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Available Sizes: </span>
                    <div className="flex gap-1 mt-1">
                      {(item as any).available_sizes.map((size: string) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Display available colors if they exist */}
                {(item as any).available_colors && (item as any).available_colors.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Available Colors: </span>
                    <div className="flex gap-1 mt-1">
                      {(item as any).available_colors.map((color: string) => (
                        <Badge key={color} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    ${item.price ? item.price.toFixed(2) : 'N/A'}
                  </span>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}