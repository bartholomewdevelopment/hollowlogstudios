import { Timestamp } from 'firebase/firestore';

/**
 * Formats a date value that could be a Firestore Timestamp, Date, string, or number.
 * Handles all edge cases including null, undefined, and serialized timestamps.
 */
export const formatDate = (date: unknown, options?: Intl.DateTimeFormatOptions): string => {
  if (!date) return 'Just now';

  let dateObj: Date | null = null;

  // Firestore Timestamp (imported)
  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  }
  // Object with toDate method (Firestore Timestamp from different import context)
  else if (typeof date === 'object' && date !== null && 'toDate' in date && typeof (date as any).toDate === 'function') {
    dateObj = (date as any).toDate();
  }
  // Object with seconds property (serialized Timestamp)
  else if (typeof date === 'object' && date !== null && 'seconds' in date) {
    dateObj = new Date((date as any).seconds * 1000);
  }
  // Date object
  else if (date instanceof Date) {
    dateObj = date;
  }
  // String or number
  else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  }

  // Validate the date
  if (dateObj && !isNaN(dateObj.getTime())) {
    return dateObj.toLocaleString(undefined, options);
  }

  return 'Just now';
};

/**
 * Formats a date as a short date string (e.g., "1/23/2026")
 */
export const formatDateShort = (date: unknown): string => {
  return formatDate(date, { dateStyle: 'short' });
};

/**
 * Formats a date with full details
 */
export const formatDateLong = (date: unknown): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
