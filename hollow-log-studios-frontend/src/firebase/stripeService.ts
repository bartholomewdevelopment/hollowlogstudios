import { loadStripe } from '@stripe/stripe-js';
import { CartItem, Purchase } from '@/types';
import { createPurchase } from './purchaseService';

const SHIPPING_COST = 4.95;

// Initialize Stripe - you'll need to add your publishable key to .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface CheckoutSessionData {
  items: CartItem[];
  customerEmail?: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create a Stripe Checkout session
 * Note: For a full implementation, you'd need a backend/Cloud Function
 * This is a simplified version that records the purchase intent
 */
export async function createCheckoutSession(data: CheckoutSessionData): Promise<string | null> {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe not initialized. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.');
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const total = subtotal + SHIPPING_COST;

    // For now, we'll use Stripe Payment Links or redirect to a checkout page
    // In production, you'd create a checkout session via a Cloud Function
    console.log('Checkout requested for:', {
      items: data.items,
      subtotal,
      shipping: SHIPPING_COST,
      total,
      email: data.customerEmail
    });

    // Return null to indicate manual handling is needed
    // You can integrate with Stripe Payment Links here
    return null;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Record a successful purchase
 */
export async function recordPurchase(
  items: CartItem[],
  customerEmail: string,
  stripeSessionId?: string,
  paymentId?: string
): Promise<Purchase[]> {
  const purchases: Purchase[] = [];

  for (const item of items) {
    const purchase = await createPurchase({
      customer_email: customerEmail,
      product_id: item.id,
      product_type: item.type,
      product_title: item.title,
      amount: (item.price || 0) * item.quantity,
      quantity: item.quantity,
      status: 'completed',
      stripe_session_id: stripeSessionId,
      payment_id: paymentId,
      metadata: {
        variant: item.variant,
        size: item.size,
        color: item.color
      }
    });
    purchases.push(purchase);
  }

  return purchases;
}

/**
 * Get Stripe instance
 */
export function getStripe() {
  return stripePromise;
}

export { SHIPPING_COST };
