import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './config';

const ARTWORKS_COLLECTION = 'artworks';

/**
 * Upload image to Firebase Storage
 * @param {File} imageFile - The image file to upload
 * @param {string} artworkId - Unique identifier for the artwork
 * @returns {Promise<string>} - Download URL of the uploaded image
 */
export const uploadImage = async (imageFile, artworkId) => {
  try {
    const timestamp = Date.now();
    const fileName = `${artworkId}_${timestamp}_${imageFile.name}`;
    const storageRef = ref(storage, `artworks/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, imageFile);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Delete image from Firebase Storage
 * @param {string} imageURL - The full URL of the image to delete
 */
export const deleteImage = async (imageURL) => {
  try {
    if (!imageURL) return;

    // Extract the file path from the URL
    const url = new URL(imageURL);
    const pathStart = url.pathname.indexOf('/o/') + 3;
    const pathEnd = url.pathname.indexOf('?');
    const filePath = decodeURIComponent(url.pathname.substring(pathStart, pathEnd));

    const imageRef = ref(storage, filePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - allow artwork deletion even if image deletion fails
  }
};

/**
 * Create a new artwork
 * @param {Object} artworkData - Artwork data including title, description, price, etc.
 * @param {File} imageFile - The image file
 * @returns {Promise<Object>} - The created artwork with ID
 */
export const createArtwork = async (artworkData, imageFile) => {
  try {
    // Generate a temporary ID for storage reference
    const tempId = `temp_${Date.now()}`;

    // Upload image first
    const imageURL = await uploadImage(imageFile, tempId);

    // Prepare artwork document
    const artwork = {
      title: artworkData.title,
      description: artworkData.description || '',
      category: artworkData.category,
      availability: artworkData.availability,
      imageURL: imageURL,
      createdAt: serverTimestamp(),
    };

    // Handle pricing based on availability
    if (artworkData.availability === 'Both') {
      artwork.printPrice = Number(artworkData.printPrice) || 0;
      artwork.originalPrice = Number(artworkData.originalPrice) || 0;
    } else {
      artwork.price = Number(artworkData.price) || 0;
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, ARTWORKS_COLLECTION), artwork);

    return { id: docRef.id, ...artwork };
  } catch (error) {
    console.error('Error creating artwork:', error);
    throw error;
  }
};

/**
 * Create two artworks (for "Both" availability)
 * Creates separate entries for Print and Original versions
 */
export const createBothArtworks = async (artworkData, imageFile) => {
  try {
    const tempId = `temp_${Date.now()}`;
    const imageURL = await uploadImage(imageFile, tempId);

    const baseArtwork = {
      title: artworkData.title,
      description: artworkData.description || '',
      category: artworkData.category,
      imageURL: imageURL,
      createdAt: serverTimestamp(),
    };

    // Create Print version
    const printArtwork = {
      ...baseArtwork,
      availability: 'Print',
      price: Number(artworkData.printPrice) || 0,
    };

    // Create Original version
    const originalArtwork = {
      ...baseArtwork,
      availability: 'Original',
      price: Number(artworkData.originalPrice) || 0,
    };

    // Add both to Firestore
    const printDoc = await addDoc(collection(db, ARTWORKS_COLLECTION), printArtwork);
    const originalDoc = await addDoc(collection(db, ARTWORKS_COLLECTION), originalArtwork);

    return [
      { id: printDoc.id, ...printArtwork },
      { id: originalDoc.id, ...originalArtwork }
    ];
  } catch (error) {
    console.error('Error creating both artworks:', error);
    throw error;
  }
};

/**
 * Get all artworks
 * @returns {Promise<Array>} - Array of all artworks
 */
export const getAllArtworks = async () => {
  try {
    const q = query(
      collection(db, ARTWORKS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const artworks = [];

    querySnapshot.forEach((doc) => {
      artworks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return artworks;
  } catch (error) {
    console.error('Error getting artworks:', error);
    throw error;
  }
};

/**
 * Update an artwork
 * @param {string} artworkId - The ID of the artwork to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateArtwork = async (artworkId, updates) => {
  try {
    const artworkRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await updateDoc(artworkRef, updates);
  } catch (error) {
    console.error('Error updating artwork:', error);
    throw error;
  }
};

/**
 * Delete an artwork
 * @param {string} artworkId - The ID of the artwork to delete
 * @param {string} imageURL - The URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteArtwork = async (artworkId, imageURL) => {
  try {
    // Delete image from Storage
    await deleteImage(imageURL);

    // Delete document from Firestore
    const artworkRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await deleteDoc(artworkRef);
  } catch (error) {
    console.error('Error deleting artwork:', error);
    throw error;
  }
};
