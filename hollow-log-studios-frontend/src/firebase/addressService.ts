import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import type { CustomerAddress } from '@/types';

const COLLECTION = 'customer_addresses';

export async function getUserAddresses(userId: string): Promise<CustomerAddress[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as CustomerAddress[];
  } catch (error) {
    console.error('Error fetching customer addresses:', error);
    throw error;
  }
}

export async function createAddress(
  data: Omit<CustomerAddress, 'id' | 'created_at' | 'updated_at'>
): Promise<CustomerAddress> {
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
    } as CustomerAddress;
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
}

export async function updateAddress(
  id: string,
  data: Partial<CustomerAddress>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating address:', error);
    return false;
  }
}

export async function deleteAddress(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
}
