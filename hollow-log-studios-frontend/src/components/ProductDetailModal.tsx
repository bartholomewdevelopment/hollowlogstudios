import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Painting } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { displayImage } from '@/lib/webImage';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  painting: Painting | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  painting,
}) => {
  const { addToCart } = useCart();

  if (!painting) return null;

  const tagPrices = painting.tag_prices || {};
  
  // Check if we have both print and original prices
  const hasPrintPrice = painting.tags.includes('Print - For Sale') && 
                       tagPrices['Print - For Sale'] !== undefined;
                       
  const hasOriginalPrice = painting.tags.includes('Original - For Sale') && 
                          tagPrices['Original - For Sale'] !== undefined;

  const getBadgeVariant = (tag: string) => {
    switch (tag) {
      case 'Original - For Sale':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Original - Sold Out':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Print - For Sale':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Custom Artwork':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleAddToCart = (variant: 'print' | 'original') => {
    let itemPrice = null;
    
    if (variant === 'print' && hasPrintPrice) {
      itemPrice = tagPrices['Print - For Sale'];
    } else if (variant === 'original' && hasOriginalPrice) {
      itemPrice = tagPrices['Original - For Sale'];
    }
    
    addToCart({
      id: painting.id,
      title: `${painting.title} (${variant === 'print' ? 'Print' : 'Original'})`,
      price: itemPrice,
      image_url: displayImage(painting),
      type: 'painting',
      variant
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{painting.title}</DialogTitle>
          <div className="flex flex-wrap gap-1 mt-2">
            {painting.tags.map((tag, index) => (
              <Badge key={index} className={getBadgeVariant(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {/* The painting gets most of the room — this is where it is seen properly */}
          <div className="flex items-center justify-center overflow-hidden rounded-md bg-stone-50 md:col-span-3">
            <img
              src={displayImage(painting)}
              alt={painting.title}
              className="max-h-[70vh] w-full object-contain"
            />
          </div>

          <div className="space-y-4 md:col-span-2">
            {painting.description && (
              <DialogDescription className="text-base">
                {painting.description}
              </DialogDescription>
            )}
            
            <div className="space-y-3">
              <h3 className="font-medium text-lg">Pricing</h3>
              
              {hasPrintPrice && (
                <div className="flex justify-between items-center">
                  <p className="text-gray-700">Print: ${tagPrices['Print - For Sale']}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#238830] text-[#238830] hover:bg-green-50 flex items-center gap-1" 
                    onClick={() => handleAddToCart('print')}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              )}
              
              {hasOriginalPrice && (
                <div className="flex justify-between items-center">
                  <p className="text-gray-700">Original: ${tagPrices['Original - For Sale']}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-[#238830] text-[#238830] hover:bg-green-50 flex items-center gap-1" 
                    onClick={() => handleAddToCart('original')}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              )}
              
              {!hasPrintPrice && !hasOriginalPrice && (
                <p className="text-gray-600 italic">Price on request</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
