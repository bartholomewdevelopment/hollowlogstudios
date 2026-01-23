import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './config';
import { Commission, DashboardSummary } from '@/types';

const COLLECTION = 'commissions';

/**
 * Create a new commission request
 */
export async function createCommission(data: Omit<Commission, 'id' | 'created_at' | 'updated_at'>): Promise<Commission> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      status: data.status || 'Not Started',
      payment_status: data.payment_status || 'Unpaid',
      total_price: data.total_price || 0,
      amount_paid: data.amount_paid || 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return {
      id: docRef.id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Commission;
  } catch (error) {
    console.error('Error creating commission:', error);
    throw error;
  }
}

/**
 * Get all commissions
 */
export async function getAllCommissions(): Promise<Commission[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Commission[];
  } catch (error) {
    console.error('Error fetching commissions:', error);
    throw error;
  }
}

/**
 * Get commissions by user ID
 */
export async function getUserCommissions(userId: string): Promise<Commission[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Commission[];
  } catch (error) {
    console.error('Error fetching user commissions:', error);
    throw error;
  }
}

/**
 * Get commissions by contact email
 */
export async function getCommissionsByContactEmail(email: string): Promise<Commission[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('contact_email', '==', email),
      orderBy('created_at', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Commission[];
  } catch (error) {
    console.error('Error fetching commissions by email:', error);
    throw error;
  }
}

/**
 * Get a single commission by ID
 */
export async function getCommissionById(id: string): Promise<Commission | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Commission;
  } catch (error) {
    console.error(`Error fetching commission with ID ${id}:`, error);
    return null;
  }
}

/**
 * Update commission status
 */
export async function updateCommissionStatus(
  id: string,
  status: Commission['status']
): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      status,
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating commission status:', error);
    return false;
  }
}

/**
 * Update commission
 */
export async function updateCommission(
  id: string,
  data: Partial<Commission>
): Promise<Commission | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) return null;

    return { id: updated.id, ...updated.data() } as Commission;
  } catch (error) {
    console.error('Error updating commission:', error);
    throw error;
  }
}

/**
 * Get dashboard summary stats
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    // Total commissions
    const totalSnapshot = await getCountFromServer(collection(db, COLLECTION));
    const total_commissions = totalSnapshot.data().count;

    // Unpaid commissions
    const unpaidQuery = query(
      collection(db, COLLECTION),
      where('payment_status', '==', 'Unpaid')
    );
    const unpaidSnapshot = await getCountFromServer(unpaidQuery);
    const unpaid_commissions = unpaidSnapshot.data().count;

    // For now, return 0 for pending_contracts and unread_messages
    // These can be implemented when those features are added
    return {
      total_commissions,
      unpaid_commissions,
      pending_contracts: 0,
      unread_messages: 0
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return {
      total_commissions: 0,
      unpaid_commissions: 0,
      pending_contracts: 0,
      unread_messages: 0
    };
  }
}
