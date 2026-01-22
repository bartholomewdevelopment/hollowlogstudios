import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const CheckoutCanceledPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <AlertCircle className="h-16 w-16 text-amber-500" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Checkout Canceled</h1>
        
        <p className="text-gray-600 mb-8">
          Your checkout process was canceled. Your cart items are still saved if you'd like to complete your purchase later.
        </p>
        
        <div className="flex flex-col space-y-4 items-center">
          <Button 
            onClick={() => {
              // Trigger the cart to open
              document.dispatchEvent(new Event('toggle-cart'));
              navigate('/');
            }}
            className="px-6"
          >
            Return to Cart
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCanceledPage;
