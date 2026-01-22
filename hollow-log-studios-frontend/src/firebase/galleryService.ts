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
import { Painting } from '@/types';

const COLLECTION = 'paintings';

/**
 * Fetch all paintings
 */
export async function fetchPaintings(): Promise<Painting[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      tag_prices: doc.data().tag_prices || {}
    })) as Painting[];
  } catch (error) {
    console.error('Error fetching paintings:', error);
    throw error;
  }
}

/**
 * Fetch a single painting by ID
 */
export async function fetchPaintingById(id: string): Promise<Painting | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
      tag_prices: docSnap.data().tag_prices || {}
    } as Painting;
  } catch (error) {
    console.error(`Error fetching painting with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch featured paintings
 */
export async function fetchFeaturedPaintings(): Promise<Painting[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('featured', '==', true),
      orderBy('created_at', 'desc'),
      limit(4)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      tag_prices: doc.data().tag_prices || {}
    })) as Painting[];
  } catch (error) {
    console.error('Error fetching featured paintings:', error);
    return [];
  }
}

/**
 * Create a new painting
 */
export async function createPainting(data: Omit<Painting, 'id' | 'created_at' | 'updated_at'>): Promise<Painting> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { id: docRef.id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Painting;
  } catch (error) {
    console.error('Error creating painting:', error);
    throw error;
  }
}

/**
 * Update a painting
 */
export async function updatePainting(id: string, data: Partial<Painting>): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating painting:', error);
    return false;
  }
}

/**
 * Update a painting's featured status
 */
export async function updatePaintingFeatured(id: string, featured: boolean): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, { featured, updated_at: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('Error updating painting featured status:', error);
    return false;
  }
}

/**
 * Delete a painting
 */
export async function deletePainting(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting painting:', error);
    return false;
  }
}
