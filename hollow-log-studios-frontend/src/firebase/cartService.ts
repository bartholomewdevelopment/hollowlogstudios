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
 * Save or update an abandoned cart
 * If a cart with the same session_id exists, update it; otherwise create new
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
    // Check if cart already exists for this session
    if (data.session_id) {
      const q = query(
        collection(db, COLLECTION),
        where('session_id', '==', data.session_id),
        where('is_converted', '==', false)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Update existing cart
        const existingDoc = snapshot.docs[0];
        const updateData: Record<string, unknown> = {
          cart_items: data.cart_items || [],
          total_price: data.total_price || 0,
          updated_at: serverTimestamp(),
          last_activity: serverTimestamp()
        };
        if (data.user_id) updateData.user_id = data.user_id;
        if (data.user_email) updateData.user_email = data.user_email;
        if (data.user_name) updateData.user_name = data.user_name;

        await updateDoc(doc(db, COLLECTION, existingDoc.id), updateData);

        return {
          id: existingDoc.id,
          ...data,
          is_converted: false,
          created_at: existingDoc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as AbandonedCart;
      }
    }

    // Create new cart if no existing one found
    const cleanData: Record<string, unknown> = {
      cart_items: data.cart_items || [],
      total_price: data.total_price || 0,
      is_converted: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      last_activity: serverTimestamp()
    };
    if (data.user_id) cleanData.user_id = data.user_id;
    if (data.session_id) cleanData.session_id = data.session_id;
    if (data.user_email) cleanData.user_email = data.user_email;
    if (data.user_name) cleanData.user_name = data.user_name;

    const docRef = await addDoc(collection(db, COLLECTION), cleanData);
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
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      // Convert Firestore Timestamps to ISO strings
      return {
        id: docSnap.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        last_activity: data.last_activity?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }) as AbandonedCart[];
  } catch (error) {
    console.error('Error fetching abandoned carts:', error);
    throw error;
  }
}

/**
 * Update cart with customer email
 */
export async function updateCartEmail(sessionId: string, email: string): Promise<boolean> {
  try {
    // Find the cart by session_id
    const q = query(
      collection(db, COLLECTION),
      where('session_id', '==', sessionId),
      where('is_converted', '==', false)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No cart found for session:', sessionId);
      return false;
    }

    // Update the most recent cart with the email
    const cartDoc = snapshot.docs[0];
    await updateDoc(doc(db, COLLECTION, cartDoc.id), {
      user_email: email,
      updated_at: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error updating cart email:', error);
    return false;
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
