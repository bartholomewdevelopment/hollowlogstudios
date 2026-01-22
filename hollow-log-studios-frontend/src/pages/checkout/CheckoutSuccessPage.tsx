import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { recordPurchase } from '@/firebase/stripeService';

const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { clearCart, items } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  // Record purchases and clear the cart when reaching the success page
  useEffect(() => {
    const savePurchases = async () => {
      if (user && sessionId && items.length > 0) {
        try {
          // Record each item in the cart as a purchase
          for (const item of items) {
            await recordPurchase({
              user_id: user.id,
              product_id: item.id,
              product_type: item.type,
              product_title: item.title,
              amount: item.price || 0,
              quantity: item.quantity,
              status: 'completed',
              payment_id: sessionId,
              metadata: {
                variant: item.variant || 'standard'
              }
            });
          }
        } catch (error) {
          console.error('Failed to record purchases:', error);
        }
      }
      // Clear the cart after recording purchases
      clearCart();
    };

    savePurchases();
  }, [clearCart, items, sessionId, user]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Thank You For Your Purchase!</h1>
        
        <p className="text-gray-600 mb-8">
          Your order has been successfully processed. You will receive a confirmation email shortly.
        </p>
        
        <div className="flex flex-col space-y-4 items-center">
          <Button 
            onClick={() => navigate('/')}
            className="px-6"
          >
            Return to Home
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/gallery')}
          >
            Continue Shopping
          </Button>

          {user && (
            <Button
              variant="link"
              onClick={() => navigate('/customer/dashboard')}
            >
              View Your Purchases
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
