import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export type ShowcaseSourceType = 'book' | 'painting' | 'character';

export interface ShowcaseRef {
  source_type: ShowcaseSourceType;
  source_id: string;
}

const COLLECTION = 'showcase';
const DOC_ID = 'config';

/**
 * The homepage showcase stores only references, in order — never copies of
 * titles or image URLs. Rename a painting in admin and the showcase follows;
 * delete one and it simply drops out.
 *
 * Returns null when nothing has been curated, which tells the homepage to
 * fall back to picking automatically.
 */
export async function getShowcaseSelection(): Promise<ShowcaseRef[] | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
    if (!snap.exists()) return null;
    const items = snap.data()?.items;
    if (!Array.isArray(items) || items.length === 0) return null;
    return items as ShowcaseRef[];
  } catch (error) {
    console.error('Error fetching showcase selection:', error);
    return null;
  }
}

export async function saveShowcaseSelection(items: ShowcaseRef[]): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTION, DOC_ID), {
      items,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving showcase selection:', error);
    throw error;
  }
}
