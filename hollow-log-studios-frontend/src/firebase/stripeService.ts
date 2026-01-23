import { loadStripe } from '@stripe/stripe-js';
import { CartItem, Purchase } from '@/types';
import { createPurchase } from './purchaseService';

const SHIPPING_COST = 4.95;

// Initialize Stripe - you'll need to add your publishable key to .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Cloud Function URL - update this after deploying functions
const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_URL ||
  'https://us-central1-hollow-log-studios-new.cloudfunctions.net';

export interface CheckoutSessionData {
  items: CartItem[];
  customerEmail?: string;
  customerName?: string;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create a Stripe Checkout session via Cloud Function
 */
export async function createCheckoutSession(items: CartItem[], collectAddress = true): Promise<string> {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe not initialized. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.');
    }

    // Call the Cloud Function to create a checkout session
    const response = await fetch(`${FUNCTIONS_BASE_URL}/createCheckoutSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
          size: item.size,
          color: item.color,
        })),
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout/canceled`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Checkout failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.url) {
      throw new Error('No checkout URL returned');
    }

    return data.url;
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
