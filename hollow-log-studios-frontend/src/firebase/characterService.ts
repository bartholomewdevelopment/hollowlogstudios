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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { Character } from '@/types';

const COLLECTION = 'characters';

/**
 * Fetch all characters
 */
export async function getAllCharacters(): Promise<Character[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Character[];
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
}

/**
 * Fetch characters by type (cryptid or pebblewick)
 */
export async function getCharactersByType(characterType: 'cryptid' | 'pebblewick'): Promise<Character[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('character_type', '==', characterType),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Character[];
  } catch (error) {
    console.error(`Error fetching ${characterType} characters:`, error);
    throw error;
  }
}

/**
 * Fetch characters by type and status
 */
export async function getCharactersByTypeAndStatus(
  characterType: 'cryptid' | 'pebblewick',
  status: 'current' | 'upcoming'
): Promise<Character[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('character_type', '==', characterType),
      where('status', '==', status),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Character[];
  } catch (error) {
    console.error(`Error fetching ${status} ${characterType} characters:`, error);
    throw error;
  }
}

/**
 * Fetch a single character by ID
 */
export async function getCharacterById(id: string): Promise<Character | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Character;
  } catch (error) {
    console.error(`Error fetching character with ID ${id}:`, error);
    return null;
  }
}

/**
 * Create a new character
 */
export async function createCharacter(data: Omit<Character, 'id' | 'created_at' | 'updated_at'>): Promise<Character> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { id: docRef.id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Character;
  } catch (error) {
    console.error('Error creating character:', error);
    throw error;
  }
}

/**
 * Update a character
 */
export async function updateCharacter(id: string, data: Partial<Character>): Promise<Character | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) return null;

    return { id: updated.id, ...updated.data() } as Character;
  } catch (error) {
    console.error('Error updating character:', error);
    throw error;
  }
}

/**
 * Delete a character
 */
export async function deleteCharacter(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting character:', error);
    return false;
  }
}
