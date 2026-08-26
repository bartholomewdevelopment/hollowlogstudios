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
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 space-y-0 border-b border-gray-200 px-6 py-4 text-left">
          <SheetTitle className="flex items-center gap-2 pr-8 text-lg">
            <ShoppingBag className="h-5 w-5 text-[#238830]" />
            Shopping Cart
            {totalItems > 0 && (
              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                {totalItems}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-full bg-gray-50 p-5">
              <ShoppingBag className="h-10 w-10 text-gray-300" />
            </div>
            <p className="font-medium text-gray-700">Your cart is empty</p>
            <p className="mt-1 text-sm text-gray-500">
              Browse the gallery and add something you love.
            </p>
            <Button variant="outline" className="mt-6" onClick={toggleCart}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Items — the only scrolling region */}
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <CartItem item={item} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary — pinned below the list */}
            <div className="shrink-0 space-y-4 border-t border-gray-200 bg-gray-50/60 px-6 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4" />
                    Shipping
                  </span>
                  <span className="font-medium text-gray-900">${shippingCost.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400">
                  From $4.95, based on how many items you order
                </p>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-[#238830]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Email status */}
              {customerEmail ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <Check className="h-4 w-4 shrink-0 text-green-600" />
                  <p className="truncate text-sm text-green-800">
                    Updates go to <strong>{customerEmail}</strong>
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShowEmailCapture(true)}
                  className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    <strong className="font-medium text-gray-800">Add email</strong> for order updates
                  </p>
                </button>
              )}

              <p className="text-xs leading-relaxed text-gray-500">
                Your card statement may show <strong className="font-medium text-gray-700">Bartholomew Development</strong>{' '}
                or <strong className="font-medium text-gray-700">Hollow Log Studios</strong> — both are us.
              </p>

              <div className="space-y-2">
                <CheckoutButton className="h-11 w-full text-base" />
                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="h-9 w-full text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
                >
                  Clear cart
                </Button>
              </div>
            </div>
          </>
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