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
import { StudioEvent } from '@/types';

const COLLECTION = 'events';

export async function getAllEvents(): Promise<StudioEvent[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as StudioEvent[];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function getUpcomingEvents(): Promise<StudioEvent[]> {
  const all = await getAllEvents();
  const today = new Date().toISOString().split('T')[0];
  return all.filter(e => e.date >= today);
}

export async function getPastEvents(): Promise<StudioEvent[]> {
  const all = await getAllEvents();
  const today = new Date().toISOString().split('T')[0];
  return all.filter(e => e.date < today).reverse(); // most recent past first
}

export async function createEvent(
  data: Omit<StudioEvent, 'id' | 'created_at' | 'updated_at'>
): Promise<StudioEvent> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return { id: docRef.id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as StudioEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function updateEvent(
  id: string,
  data: Partial<Omit<StudioEvent, 'id' | 'created_at'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}
