import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { saveAbandonedCart } from '@/firebase/cartService';

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
      const newSessionId = crypto.randomUUID();
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

        saveAbandonedCart({
          user_id: user?.id,
          session_id: sessionId,
          cart_items: cartItems,
          total_price: totalPrice,
          user_email: user?.email,
          user_name: user ? `${user.first_name} ${user.last_name}` : undefined
        }).catch(err => console.error('Error saving abandoned cart:', err));
      }
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  }, [cartItems, user, sessionId]);

  const getCartItemKey = (id: string, variant?: string) => {
    return variant ? `${id}-${variant}` : id;
  };

  const addToCart = (item: Omit<CartItem, 'quantity'> & { variant?: string }) => {
    const { variant, ...itemData } = item;
    const cartItemKey = getCartItemKey(item.id, variant);

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i =>
        getCartItemKey(i.id, i.variant as string) === cartItemKey
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

  const removeFromCart = (id: string, variant?: string) => {
    const cartItemKey = getCartItemKey(id, variant);

    setCartItems(prevItems => {
      const itemToRemove = prevItems.find(item =>
        getCartItemKey(item.id, item.variant as string) === cartItemKey
      );

      if (itemToRemove) {
        toast({
          title: 'Removed from cart',
          description: `${itemToRemove.title} has been removed from your cart`,
        });
      }

      return prevItems.filter(item =>
        getCartItemKey(item.id, item.variant as string) !== cartItemKey
      );
    });
  };

  const updateQuantity = (id: string, quantity: number, variant?: string) => {
    const cartItemKey = getCartItemKey(id, variant);

    if (quantity <= 0) {
      removeFromCart(id, variant);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        getCartItemKey(item.id, item.variant as string) === cartItemKey
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
