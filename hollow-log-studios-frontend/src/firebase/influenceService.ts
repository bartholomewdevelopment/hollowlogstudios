import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Influence } from '@/types';

const COLLECTION = 'influences';

export async function getAllInfluences(): Promise<Influence[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Influence[];
  } catch (error) {
    console.error('Error fetching influences:', error);
    throw error;
  }
}

export async function createInfluence(
  data: Omit<Influence, 'id' | 'created_at' | 'updated_at'>
): Promise<Influence> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return {
      id: docRef.id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Influence;
  } catch (error) {
    console.error('Error creating influence:', error);
    throw error;
  }
}

export async function updateInfluence(
  id: string,
  data: Partial<Omit<Influence, 'id' | 'created_at'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), { ...data, updated_at: serverTimestamp() });
  } catch (error) {
    console.error('Error updating influence:', error);
    throw error;
  }
}

export async function deleteInfluence(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting influence:', error);
    throw error;
  }
}

/** The eight artists that were previously hard-coded into the About page.
 *  Offered as a one-click import so nothing has to be retyped. */
export const DEFAULT_INFLUENCES: Array<Pick<Influence, 'name' | 'note'>> = [
  { name: 'Beatrix Potter', note: 'Nature-rooted storytelling with a tender hand.' },
  { name: 'Leo & Diane Dillon', note: 'Lyrical color and generous representation.' },
  { name: 'N.C. Wyeth', note: 'Cinematic composition and warm atmosphere.' },
  { name: 'Maurice Sendak', note: 'Whimsy with a hint of wildness.' },
  { name: 'James C. Christensen', note: 'Mythic charm with intricate detail.' },
  { name: 'Thomas Blackshear', note: 'Elegant figures and soulful expressions.' },
  { name: 'Norman Rockwell', note: 'Everyday stories rendered with heart.' },
  { name: 'The Leyendecker Brothers', note: 'Classic illustration drama and flow.' },
];

export async function seedDefaultInfluences(): Promise<number> {
  const existing = await getAllInfluences();
  const have = new Set(existing.map(i => i.name.toLowerCase()));
  const missing = DEFAULT_INFLUENCES.filter(i => !have.has(i.name.toLowerCase()));
  for (const influence of missing) {
    await createInfluence({ ...influence, image_url: null });
  }
  return missing.length;
}
