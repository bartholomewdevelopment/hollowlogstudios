import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Truck } from 'lucide-react';

interface ProductPurchaseCardProps {
  id: string;
  title: string;
  description?: string;
  price: number;
  image_url?: string;
  type?: string;
  showAddToCart?: boolean;
  tags?: string[];
  tagPrices?: Record<string, number>;
}

const ProductPurchaseCard: React.FC<ProductPurchaseCardProps> = ({
  id,
  title,
  description,
  price,
  image_url,
  type = 'product',
  showAddToCart = true,
  tags = [],
  tagPrices,
}) => {
  const { addToCart } = useCart();

  // Check if we have both print and original prices
  const hasPrintPrice = tags.includes('Print - For Sale') && tagPrices?.['Print - For Sale'];
  const hasOriginalPrice = tags.includes('Original - For Sale') && tagPrices?.['Original - For Sale'];

  const handleAddToCart = (variant: 'print' | 'original') => {
    let itemPrice = price;
    
    if (variant === 'print' && hasPrintPrice) {
      itemPrice = tagPrices?.['Print - For Sale'] || price;
    } else if (variant === 'original' && hasOriginalPrice) {
      itemPrice = tagPrices?.['Original - For Sale'] || price;
    }
    
    // Ensure price is a valid number
    if (!itemPrice || itemPrice <= 0) {
      console.error(`Invalid price for ${title} (${variant}):`, itemPrice);
      return;
    }
    
    addToCart({
      id,
      title: `${title} (${variant === 'print' ? 'Print' : 'Original'})`,
      description: description || `${title} - ${variant === 'print' ? 'Print' : 'Original'}`,
      price: itemPrice,
      image_url: image_url || '',
      type: 'painting',
      variant,
    });
  };

  // Default product add to cart handler
  const handleDefaultAddToCart = () => {
    // Ensure price is a valid number
    if (!price || price <= 0) {
      console.error(`Invalid price for ${title}:`, price);
      return;
    }
    
    addToCart({
      id,
      title,
      description: description || title,
      price,
      image_url: image_url || '',
      type: type as 'painting' | 'book',
    });
  };

  return (
    <Card className="overflow-hidden">
      {image_url && (
        <div className="aspect-square overflow-hidden">
          <img 
            src={image_url} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="text-sm text-gray-500">{description}</p>}
        
        {/* Show both prices if available */}
        <div className="mt-2 space-y-2">
          {hasPrintPrice && (
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium">Print: ${tagPrices?.['Print - For Sale'].toFixed(2)}</p>
              {showAddToCart && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-2 text-xs flex items-center gap-1" 
                  onClick={() => handleAddToCart('print')}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Add
                </Button>
              )}
            </div>
          )}
          
          {hasOriginalPrice && (
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium">Original: ${tagPrices?.['Original - For Sale'].toFixed(2)}</p>
              {showAddToCart && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 px-2 text-xs flex items-center gap-1" 
                  onClick={() => handleAddToCart('original')}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Add
                </Button>
              )}
            </div>
          )}
          
          {!hasPrintPrice && !hasOriginalPrice && price > 0 && (
            <p className="text-xl font-bold">${price.toFixed(2)}</p>
          )}
        </div>
        
        {/* Shipping notice */}
        <div className="mt-3 p-2 bg-blue-50 rounded-md">
          <div className="flex items-center text-sm text-blue-800">
            <Truck className="mr-2 h-4 w-4" />
            <span>+ $4.95 shipping on all orders</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {(hasPrintPrice || hasOriginalPrice) ? (
          <div className="w-full text-center text-sm text-gray-500 mb-2">
            Select an option above to add to cart
          </div>
        ) : (
          showAddToCart && price > 0 && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDefaultAddToCart}
            >
              Add to Cart
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductPurchaseCard;