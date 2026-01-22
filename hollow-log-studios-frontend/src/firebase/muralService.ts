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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { Mural } from '@/types';

const COLLECTION = 'murals';

/**
 * Fetch all murals
 */
export async function getMurals(): Promise<Mural[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Mural[];
  } catch (error) {
    console.error('Error fetching murals:', error);
    throw error;
  }
}

/**
 * Fetch a single mural by ID
 */
export async function getMuralById(id: string): Promise<Mural | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Mural;
  } catch (error) {
    console.error(`Error fetching mural with ID ${id}:`, error);
    return null;
  }
}

/**
 * Create a new mural
 */
export async function createMural(data: Omit<Mural, 'id' | 'created_at' | 'updated_at'>): Promise<Mural> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { id: docRef.id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Mural;
  } catch (error) {
    console.error('Error creating mural:', error);
    throw error;
  }
}

/**
 * Update a mural
 */
export async function updateMural(id: string, data: Partial<Mural>): Promise<Mural | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) return null;

    return { id: updated.id, ...updated.data() } as Mural;
  } catch (error) {
    console.error('Error updating mural:', error);
    throw error;
  }
}

/**
 * Delete a mural
 */
export async function deleteMural(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting mural:', error);
    return false;
  }
}
