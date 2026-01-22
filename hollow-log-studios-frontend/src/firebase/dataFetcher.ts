import {
  collection,
  getDocs,
  query,
  orderBy,
  getCountFromServer
} from 'firebase/firestore';
import { db } from './config';

/**
 * Fetch all documents from a table/collection
 */
export async function fetchAllFromTable(tableName: string): Promise<any[]> {
  try {
    const q = query(collection(db, tableName), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching from ${tableName}:`, error);
    return [];
  }
}

/**
 * Check if a table/collection has any data
 */
export async function checkTableHasData(tableName: string): Promise<boolean> {
  try {
    const snapshot = await getCountFromServer(collection(db, tableName));
    return snapshot.data().count > 0;
  } catch (error) {
    console.error(`Error checking data in ${tableName}:`, error);
    return false;
  }
}

/**
 * Generic fetch with error handling
 */
export async function fetchDataWithErrorHandling<T>(
  fetchFn: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    console.error('Error fetching data:', error);
    return defaultValue;
  }
}
