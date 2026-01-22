import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import CheckoutForm from './CheckoutForm';

interface CheckoutButtonProps {
  className?: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ className }) => {
  const { cartItems } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Your cart is empty',
        description: 'Please add items to your cart before checking out',
        variant: 'destructive',
      });
      return;
    }

    setShowCheckoutForm(true);
  };

  return (
    <>
      <Button
        className={`bg-[#238830] hover:bg-green-700 text-white ${className}`}
        onClick={handleCheckout}
        disabled={cartItems.length === 0}
      >
        Checkout
      </Button>
      
      <CheckoutForm 
        open={showCheckoutForm} 
        onOpenChange={setShowCheckoutForm} 
      />
    </>
  );
};

export default CheckoutButton;