import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { saveAbandonedCart } from '@/firebase/cartService';
import { v4 as uuidv4 } from 'uuid';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { variant?: string }) => void;
  removeFromCart: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  cartOpen: boolean;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
  shippingCost: number;
  grandTotal: number;
}

const SHIPPING_COST = 4.95;

const defaultCartContext: CartContextType = {
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartOpen: false,
  toggleCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  shippingCost: SHIPPING_COST,
  grandTotal: 0,
};

const CartContext = createContext<CartContextType>(defaultCartContext);

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string>('');

  // Generate a session ID for anonymous users
  useEffect(() => {
    const savedSessionId = localStorage.getItem('cart_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newSessionId = uuidv4();
      localStorage.setItem('cart_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        localStorage.removeItem('cart');
      }
    }

    const handleToggleCart = () => setCartOpen(true);
    document.addEventListener('toggle-cart', handleToggleCart);

    return () => {
      document.removeEventListener('toggle-cart', handleToggleCart);
    };
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));

      if (cartItems.length > 0) {
        const totalPrice = cartItems.reduce((total, item) => {
          return total + (item.price || 0) * item.quantity;
        }, 0);

        // Get email from user account or localStorage
        const customerEmail = user?.email || localStorage.getItem('customer_email') || undefined;

        saveAbandonedCart({
          user_id: user?.id,
          session_id: sessionId,
          cart_items: cartItems,
          total_price: totalPrice,
          user_email: customerEmail,
          user_name: user ? `${user.first_name} ${user.last_name}` : undefined
        }).catch(err => console.error('Error saving abandoned cart:', err));
      }
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [cartItems, user, sessionId]);

  // Create a unique key for cart items including size/color variants
  const getCartItemKey = (item: { id: string; variant?: string; size?: string; color?: string }) => {
    const parts = [item.id];
    if (item.variant) parts.push(item.variant);
    if (item.size) parts.push(item.size);
    if (item.color) parts.push(item.color);
    return parts.join('-');
  };

  // Simple key from id and variant string (for backward compatibility)
  const getSimpleKey = (id: string, variantStr?: string) => {
    return variantStr ? `${id}-${variantStr}` : id;
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { variant?: string }) => {
    const { variant, ...itemData } = item;
    const newItem = { ...itemData, variant };
    const cartItemKey = getCartItemKey(newItem as CartItem);

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i =>
        getCartItemKey(i) === cartItemKey
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        toast({
          title: 'Quantity updated',
          description: `${item.title} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        });
        return updatedItems;
      } else {
        toast({
          title: 'Added to cart',
          description: `${item.title} has been added to your cart`,
        });
        return [...prevItems, { ...itemData, variant, quantity: 1 }];
      }
    });

    setCartOpen(true);
  };

  const removeFromCart = (id: string, variantKey?: string) => {
    const searchKey = getSimpleKey(id, variantKey);

    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item =>
        getCartItemKey(item) === searchKey
      );

      if (itemToRemove) {
        toast({
          title: 'Removed from cart',
          description: `${itemToRemove.title} has been removed from your cart`,
        });
      }

      return prevItems.filter(item =>
        getCartItemKey(item) !== searchKey
      );
    });
  };

  const updateQuantity = (id: string, quantity: number, variantKey?: string) => {
    const searchKey = getSimpleKey(id, variantKey);

    if (quantity <= 0) {
      removeFromCart(id, variantKey);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        getCartItemKey(item) === searchKey
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
    });
  };

  const toggleCart = () => {
    setCartOpen(prev => !prev);
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => {
    return total + (item.price || 0) * item.quantity;
  }, 0);
  const shippingCost = cartItems.length > 0 ? SHIPPING_COST : 0;
  const grandTotal = totalPrice + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartOpen,
        toggleCart,
        totalItems,
        totalPrice,
        shippingCost,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
