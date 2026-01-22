import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { createCheckoutSession } from '@/firebase/stripeService';
import { markCartAsConverted } from '@/firebase/cartService';
import { Loader2, Truck } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface CheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ open, onOpenChange }) => {
  const { cartItems, toggleCart, clearCart, totalPrice, shippingCost, grandTotal } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const validCartItems = cartItems
        .filter(item => item.price && item.price > 0)
        .map(item => ({
          ...item,
          title: item.title || 'Art Product',
          description: item.description || item.title || 'Art product',
          quantity: item.quantity || 1
        }));
      
      if (validCartItems.length === 0) {
        throw new Error('No valid items in cart');
      }
      
      // Pass true to indicate we want Stripe to collect shipping/billing addresses
      const checkoutUrl = await createCheckoutSession(validCartItems, true);
      
      const cartSessionId = localStorage.getItem('cart_session_id');
      if (cartSessionId) {
        await markCartAsConverted(cartSessionId);
      }
      
      onOpenChange(false);
      toggleCart();
      
      if (checkoutUrl.startsWith('/')) {
        navigate(checkoutUrl);
        clearCart();
      } else {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Truck className="mr-2 h-4 w-4" />
                <span>Shipping</span>
              </div>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Secure Checkout with Stripe</p>
            <p>You'll be redirected to Stripe to securely enter your payment information and shipping/billing addresses.</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isLoading || cartItems.length === 0}
              className="flex-1 bg-[#238830] hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Stripe'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutForm;