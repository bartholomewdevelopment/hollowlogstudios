import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const BOOKINGS_COLLECTION = 'bookings';

/**
 * Create a new booking/inquiry
 * @param {Object} bookingData - Booking data including name, email, message, etc.
 * @returns {Promise<Object>} - The created booking with ID
 */
export const createBooking = async (bookingData) => {
  try {
    const booking = {
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone || '',
      artworkId: bookingData.artworkId || null,
      artworkTitle: bookingData.artworkTitle || '',
      message: bookingData.message || '',
      status: 'pending', // pending, contacted, completed, cancelled
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);

    return { id: docRef.id, ...booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Get all bookings
 * @returns {Promise<Array>} - Array of all bookings
 */
export const getAllBookings = async () => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

/**
 * Get bookings by status
 * @param {string} status - The status to filter by
 * @returns {Promise<Array>} - Array of filtered bookings
 */
export const getBookingsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const bookings = [];

    querySnapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return bookings;
  } catch (error) {
    console.error('Error getting bookings by status:', error);
    throw error;
  }
};

/**
 * Update booking status
 * @param {string} bookingId - The ID of the booking to update
 * @param {string} status - New status (pending, contacted, completed, cancelled)
 * @returns {Promise<void>}
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

/**
 * Delete a booking
 * @param {string} bookingId - The ID of the booking to delete
 * @returns {Promise<void>}
 */
export const deleteBooking = async (bookingId) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};
