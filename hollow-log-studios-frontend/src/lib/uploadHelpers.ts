import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';
import { convertHeicToJpeg } from '@/lib/heic';

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param bucket The storage folder/bucket name
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(original: File, bucket: string = 'paintings'): Promise<string> {
  try {
    // First, ensure user is authenticated
    const user = auth.currentUser;

    if (!user) {
      throw new Error('You must be logged in to upload files');
    }

    // iPhone HEIC photos are stored as JPEG so every browser can show them
    const file = await convertHeicToJpeg(original);

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;

    // Create a reference to the file location
    const storageRef = ref(storage, filePath);

    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: user.uid,
        originalName: original.name
      }
    });

    // Get the public URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

/**
 * Deletes a file from Firebase Storage
 * @param url The public URL of the file to delete
 * @param bucket The storage folder/bucket name (not used directly, extracted from URL)
 */
export async function deleteFile(url: string, bucket: string = 'paintings'): Promise<boolean> {
  try {
    // Check authentication first
    const user = auth.currentUser;

    if (!user) {
      throw new Error('You must be logged in to delete files');
    }

    // Create a reference from the URL
    const storageRef = ref(storage, url);

    // Delete the file
    await deleteObject(storageRef);

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
}

/**
 * Uploads multiple files to Firebase Storage
 * @param files Array of files to upload
 * @param bucket The storage folder/bucket name
 * @returns Array of public URLs of the uploaded files
 */
export async function uploadMultipleFiles(files: File[], bucket: string = 'paintings'): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file, bucket));
  return Promise.all(uploadPromises);
}
