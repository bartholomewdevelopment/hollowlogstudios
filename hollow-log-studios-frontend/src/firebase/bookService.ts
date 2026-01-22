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
import { Book } from '@/types';

const COLLECTION = 'books';

/**
 * Fetch all books
 */
export async function fetchBooks(): Promise<Book[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Book[];
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

/**
 * Alias for fetchBooks
 */
export const getBooks = fetchBooks;

/**
 * Fetch a single book by ID
 */
export async function getBookById(id: string): Promise<Book | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Book;
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch featured book
 */
export async function getFeaturedBook(): Promise<Book | null> {
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
    } as Book;
  } catch (error) {
    console.error('Error fetching featured book:', error);
    return null;
  }
}

/**
 * Add a new book
 */
export async function addBook(data: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    return { id: docRef.id, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Book;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
}

/**
 * Update a book
 */
export async function updateBook(id: string, data: Partial<Book>): Promise<Book | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp()
    });

    const updated = await getDoc(docRef);
    if (!updated.exists()) return null;

    return { id: updated.id, ...updated.data() } as Book;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
}

/**
 * Delete a book
 */
export async function deleteBook(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting book:', error);
    return false;
  }
}
