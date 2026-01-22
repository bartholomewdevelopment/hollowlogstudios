import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { markCartAsConverted } from '@/firebase/cartService';
import { toast } from '@/components/ui/use-toast';
import { createCheckoutSession } from '@/firebase/stripeService';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutButtonProps {
  productId?: string;
  productType?: string;
  productTitle?: string;
  productDescription?: string;
  price?: number;
  quantity?: number;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  productId,
  productType,
  productTitle,
  productDescription,
  price,
  quantity = 1,
  disabled = false,
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // For single product checkout
      if (productId && productType && productTitle && price && price > 0) {
        const singleItem = [{
          id: productId,
          type: productType as 'painting' | 'book',
          title: productTitle,
          description: productDescription || productTitle,
          price,
          quantity,
          image_url: ''
        }];
        
        console.log('Single item checkout:', singleItem);
        const checkoutUrl = await createCheckoutSession(singleItem);
        window.location.href = checkoutUrl;
        return;
      } 
      
      // For cart checkout
      if (cartItems.length === 0) {
        toast({
          title: 'Cart is empty',
          description: 'Please add items to your cart before checking out.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate and format cart items
      const validCartItems = cartItems
        .filter(item => item.price && item.price > 0)
        .map(item => ({
          ...item,
          title: item.title || 'Art Product',
          description: item.description || item.title || 'Art product',
          quantity: item.quantity || 1
        }));
      
      if (validCartItems.length === 0) {
        toast({
          title: 'Invalid cart items',
          description: 'Your cart contains items with invalid prices.',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Cart checkout:', validCartItems);
      const checkoutUrl = await createCheckoutSession(validCartItems);
      
      // Mark cart as converted
      const cartSessionId = localStorage.getItem('cart_session_id');
      if (cartSessionId) {
        await markCartAsConverted(cartSessionId);
      }
      
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading || (!productId && cartItems.length === 0)}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Checkout'
      )}
    </Button>
  );
};

export default StripeCheckoutButton;