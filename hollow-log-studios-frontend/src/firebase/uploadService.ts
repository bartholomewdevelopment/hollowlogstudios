import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage, auth } from './config';

/**
 * Validate file type and size
 */
function validateFile(file: File): void {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF are allowed.');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
}

/**
 * Generate a unique filename
 */
function generateFileName(file: File): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = file.name.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  folder: string = 'uploads'
): Promise<string> {
  validateFile(file);

  const fileName = generateFileName(file);
  const filePath = `${folder}/${fileName}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string = 'uploads'
): Promise<string[]> {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(file => uploadFile(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract path from URL
    const url = new URL(fileUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
    if (!pathMatch) {
      throw new Error('Invalid file URL');
    }
    const filePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * List files in a folder
 */
export async function listFiles(folder: string): Promise<string[]> {
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    const urls = await Promise.all(
      result.items.map(item => getDownloadURL(item))
    );
    return urls;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Upload artwork image (convenience function)
 */
export async function uploadArtworkImage(file: File): Promise<string> {
  return uploadFile(file, 'artworks');
}

/**
 * Upload commission file (convenience function)
 */
export async function uploadCommissionFile(file: File, commissionId: string): Promise<string> {
  return uploadFile(file, `commissions/${commissionId}`);
}
