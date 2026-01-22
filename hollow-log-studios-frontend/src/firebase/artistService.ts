import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { ArtistProfile } from '@/types';

const COLLECTION = 'artist_profile';
const DOCUMENT_ID = 'main';

/**
 * Get the artist profile (singleton)
 */
export async function getArtistProfile(): Promise<ArtistProfile | null> {
  try {
    const docRef = doc(db, COLLECTION, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as ArtistProfile;
  } catch (error) {
    console.error('Error fetching artist profile:', error);
    return null;
  }
}

/**
 * Update the artist profile
 */
export async function updateArtistProfile(data: Partial<ArtistProfile>): Promise<ArtistProfile | null> {
  try {
    const docRef = doc(db, COLLECTION, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...data,
        updated_at: serverTimestamp()
      });
    } else {
      await setDoc(docRef, {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    }

    const updated = await getDoc(docRef);
    if (!updated.exists()) return null;

    return { id: updated.id, ...updated.data() } as ArtistProfile;
  } catch (error) {
    console.error('Error updating artist profile:', error);
    throw error;
  }
}
