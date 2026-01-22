import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { Purchase } from '@/types';

const COLLECTION = 'purchases';

/**
 * Create a new purchase record
 */
export async function createPurchase(data: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>): Promise<Purchase> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return {
      id: docRef.id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Purchase;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
}

/**
 * Get all purchases
 */
export async function getAllPurchases(): Promise<Purchase[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Purchase[];
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
}

/**
 * Get purchases by user email
 */
export async function getUserPurchases(email: string): Promise<Purchase[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('customer_email', '==', email),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Purchase[];
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    throw error;
  }
}

/**
 * Get a single purchase by ID
 */
export async function getPurchaseById(id: string): Promise<Purchase | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Purchase;
  } catch (error) {
    console.error(`Error fetching purchase with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get purchases by Stripe session ID
 */
export async function getPurchaseByStripeSession(sessionId: string): Promise<Purchase | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('stripe_session_id', '==', sessionId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Purchase;
  } catch (error) {
    console.error('Error fetching purchase by Stripe session:', error);
    return null;
  }
}
