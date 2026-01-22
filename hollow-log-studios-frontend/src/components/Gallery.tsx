import React, { useEffect, useState } from 'react';
import { fetchPaintings } from '@/firebase/galleryService';
import { Painting } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const Gallery: React.FC = () => {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadPaintings = async () => {
      try {
        setLoading(true);
        const data = await fetchPaintings();
        setPaintings(data);
      } catch (error) {
        console.error('Error loading paintings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaintings();
  }, []);

  const handleAddToCart = (painting: Painting, variant: 'print' | 'original') => {
    let itemPrice = null;
    
    if (variant === 'print' && painting.tag_prices?.['Print - For Sale']) {
      itemPrice = painting.tag_prices['Print - For Sale'];
    } else if (variant === 'original' && painting.tag_prices?.['Original - For Sale']) {
      itemPrice = painting.tag_prices['Original - For Sale'];
    }
    
    addToCart({
      id: painting.id,
      title: `${painting.title} (${variant === 'print' ? 'Print' : 'Original'})`,
      price: itemPrice,
      image_url: painting.image_url,
      type: 'painting',
      variant
    });
  };

  if (loading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gallery</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paintings.map((painting) => {
          const hasPrintPrice = painting.tags.includes('Print - For Sale') && 
                              painting.tag_prices && 
                              painting.tag_prices['Print - For Sale'] !== undefined;
                              
          const hasOriginalPrice = painting.tags.includes('Original - For Sale') && 
                                 painting.tag_prices && 
                                 painting.tag_prices['Original - For Sale'] !== undefined;
          
          return (
            <div key={painting.id} className="group">
              <div className="aspect-square rounded-lg overflow-hidden mb-2">
                <img 
                  src={painting.image_url} 
                  alt={painting.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-[#238830] transition-colors">
                {painting.title}
              </h3>
              
              <div className="mt-2 space-y-1">
                {hasPrintPrice && (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Print: ${painting.tag_prices['Print - For Sale']}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 px-2 text-xs flex items-center gap-1 border-[#238830] text-[#238830] hover:bg-green-50" 
                      onClick={() => handleAddToCart(painting, 'print')}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                )}
                
                {hasOriginalPrice && (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Original: ${painting.tag_prices['Original - For Sale']}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 px-2 text-xs flex items-center gap-1 border-[#238830] text-[#238830] hover:bg-green-50" 
                      onClick={() => handleAddToCart(painting, 'original')}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                )}
                
                {!hasPrintPrice && !hasOriginalPrice && (
                  <p className="text-gray-600">Price on request</p>
                )}
              </div>
              
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  className="w-full border-[#238830] text-[#238830] hover:bg-green-50"
                >
                  View Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;