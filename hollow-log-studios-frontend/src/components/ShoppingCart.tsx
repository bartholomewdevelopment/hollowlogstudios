import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/CartItem';
import CheckoutButton from '@/components/CheckoutButton';
import { ShoppingBag, Truck } from 'lucide-react';

const ShoppingCart: React.FC = () => {
  const { cartItems, cartOpen, toggleCart, clearCart, totalItems, totalPrice, shippingCost, grandTotal } = useCart();

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
                    <strong>Mandatory shipping:</strong> $4.95 added to all orders
                  </p>
                </div>
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
    </Sheet>
  );
};

export default ShoppingCart;