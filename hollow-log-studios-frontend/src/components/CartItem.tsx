import React from 'react';
import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, X } from 'lucide-react';
import PreOrderBadge from '@/components/PreOrderBadge';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { id, title, price, image_url, quantity, variant, size, color, pre_order } = item;
  
  const formattedPrice = price ? `$${price.toFixed(2)}` : 'Price on request';
  const itemTotal = price ? `$${(price * quantity).toFixed(2)}` : 'N/A';

  // Create a unique key for items with size/color variants
  const getVariantKey = () => {
    const parts = [];
    if (variant) parts.push(variant);
    if (size) parts.push(size);
    if (color) parts.push(color);
    return parts.join('-');
  };

  const variantKey = getVariantKey();

  return (
    <div className="flex py-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <img
          src={image_url}
          alt={title}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <h3 className="line-clamp-1">{title}</h3>
          <p className="ml-4">{itemTotal}</p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm text-gray-500">{formattedPrice} each</p>
          {pre_order && <PreOrderBadge />}
        </div>
        
        {/* Display variant information */}
        {(variant || size || color) && (
          <div className="mt-1 text-xs text-gray-500">
            {variant && <span className="capitalize">{variant}</span>}
            {size && <span>{variant ? ' • ' : ''}Size: {size}</span>}
            {color && <span>{(variant || size) ? ' • ' : ''}Color: {color}</span>}
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center border rounded-md">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(id, quantity - 1, variantKey)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="px-2">{quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(id, quantity + 1, variantKey)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-gray-500"
            onClick={() => removeFromCart(id, variantKey)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;