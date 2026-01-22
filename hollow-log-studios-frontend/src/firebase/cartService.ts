import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { AbandonedCart, CartItem } from '@/types';

const COLLECTION = 'abandoned_carts';

/**
 * Save an abandoned cart
 */
export async function saveAbandonedCart(data: {
  user_id?: string;
  session_id?: string;
  cart_items: CartItem[];
  total_price: number;
  user_email?: string;
  user_name?: string;
}): Promise<AbandonedCart> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      is_converted: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_activity: serverTimestamp()
    });
    return {
      id: docRef.id,
      ...data,
      is_converted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as AbandonedCart;
  } catch (error) {
    console.error('Error saving abandoned cart:', error);
    throw error;
  }
}

/**
 * Get all abandoned (unconverted) carts
 */
export async function getAbandonedCarts(): Promise<AbandonedCart[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('is_converted', '==', false),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AbandonedCart[];
  } catch (error) {
    console.error('Error fetching abandoned carts:', error);
    throw error;
  }
}

/**
 * Mark a cart as converted (purchased)
 */
export async function markCartAsConverted(cartId: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION, cartId);
    await updateDoc(docRef, {
      is_converted: true,
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error marking cart as converted:', error);
    return false;
  }
}

/**
 * Update cart activity timestamp
 */
export async function updateCartActivity(cartId: string): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION, cartId);
    await updateDoc(docRef, {
      last_activity: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating cart activity:', error);
    return false;
  }
}
