import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { Testimonial } from '@/types';

const COLLECTION = 'testimonials';

export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Testimonial[];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
}

export async function createTestimonial(
  data: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>
): Promise<Testimonial> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { id: docRef.id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Testimonial;
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
}

export async function updateTestimonial(
  id: string,
  data: Partial<Omit<Testimonial, 'id' | 'created_at'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
}
