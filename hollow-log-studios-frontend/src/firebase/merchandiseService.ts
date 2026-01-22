import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { Merchandise, MerchandiseImage } from '@/types';

const COLLECTION = 'merchandise';

/**
 * Fetch all merchandise
 */
export async function fetchMerchandise(): Promise<Merchandise[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Merchandise[];
  } catch (error) {
    console.error('Error fetching merchandise:', error);
    throw error;
  }
}

/**
 * Alias for fetchMerchandise
 */
export const getMerchandise = fetchMerchandise;

/**
 * Fetch a single merchandise item by ID
 */
export async function getMerchandiseById(id: string): Promise<Merchandise | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Merchandise;
  } catch (error) {
    console.error(`Error fetching merchandise with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch featured merchandise
 */
export async function getFeaturedMerchandise(): Promise<Merchandise | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('featured', '==', true),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Merchandise;
  } catch (error) {
    console.error('Error fetching featured merchandise:', error);
    return null;
  }
}

/**
 * Add new merchandise
 */
export async function addMerchandise(data: Omit<Merchandise, 'id' | 'created_at' | 'updated_at'>): Promise<Merchandise> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { id: docRef.id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Merchandise;
  } catch (error) {
    console.error('Error adding merchandise:', error);
    throw error;
  }
}

/**
 * Update merchandise
 */
export async function updateMerchandise(id: string, data: Partial<Merchandise>): Promise<Merchandise | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) return null;

    return { id: updated.id, ...updated.data() } as Merchandise;
  } catch (error) {
    console.error('Error updating merchandise:', error);
    throw error;
  }
}

/**
 * Delete merchandise
 */
export async function deleteMerchandise(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting merchandise:', error);
    return false;
  }
}
