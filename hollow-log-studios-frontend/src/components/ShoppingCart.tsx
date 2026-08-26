import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import CheckoutButton from '@/components/CheckoutButton';
import EmailCapture from '@/components/EmailCapture';
import { ShoppingBag, Truck, Mail, Check } from 'lucide-react';

const ShoppingCart: React.FC = () => {
  const { cartItems, cartOpen, toggleCart, clearCart, totalItems, totalPrice, shippingCost, grandTotal } = useCart();
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  // Check for stored email on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('customer_email');
    if (storedEmail) {
      setCustomerEmail(storedEmail);
    }
  }, []);

  // Show email capture when cart opens with items and no email stored
  useEffect(() => {
    if (cartOpen && cartItems.length > 0 && !customerEmail) {
      const skipped = localStorage.getItem('email_capture_skipped');
      if (!skipped) {
        // Small delay so the cart animation completes first
        const timer = setTimeout(() => setShowEmailCapture(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [cartOpen, cartItems.length, customerEmail]);

  const handleEmailSubmit = (email: string) => {
    setCustomerEmail(email);
  };

  return (
    <Sheet open={cartOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">Your cart is empty</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={toggleCart}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <li key={`${item.type}-${item.id}`} className="py-2">
                      <CartItem item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-200 py-4 mt-auto">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-base text-gray-900">
                  <p>Subtotal</p>
                  <p>${totalPrice.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base text-gray-900">
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    <p>Shipping</p>
                  </div>
                  <p>${shippingCost.toFixed(2)}</p>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <p>Total</p>
                  <p>${grandTotal.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="flex items-center">
                  <Truck className="mr-2 h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    <strong>Shipping:</strong> from $4.95, based on how many items you order
                  </p>
                </div>
              </div>

              {/* Email status */}
              {customerEmail ? (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      Updates will be sent to <strong>{customerEmail}</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowEmailCapture(true)}
                  className="w-full bg-gray-50 hover:bg-gray-100 p-3 rounded-lg mb-4 text-left transition-colors"
                >
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      <strong>Add email</strong> for order updates
                    </p>
                  </div>
                </button>
              )}
              
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-2">
                <p className="text-xs text-amber-800 leading-snug">
                  <strong>Heads up:</strong> Your card statement and Stripe checkout screen could show a charge from either <strong>Bartholomew Development</strong> or <strong>Hollow Log Studios</strong> — both are us! Don't worry, your order is safe.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <CheckoutButton />
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>

      {/* Email Capture Modal */}
      <EmailCapture
        open={showEmailCapture}
        onOpenChange={setShowEmailCapture}
        onEmailSubmit={handleEmailSubmit}
      />
    </Sheet>
  );
};

export default ShoppingCart;