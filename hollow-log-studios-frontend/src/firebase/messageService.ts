import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Message, MessageAttachment } from '@/types';
import { uploadCommissionFile } from './uploadService';

const COLLECTION = 'commissions';

/**
 * Get messages for a commission
 */
export async function getCommissionMessages(commissionId: string): Promise<Message[]> {
  try {
    const messagesRef = collection(db, COLLECTION, commissionId, 'messages');
    const q = query(messagesRef, orderBy('created_at', 'asc'));
    const snapshot = await getDocs(q);

    const messages: Message[] = [];
    for (const docSnap of snapshot.docs) {
      const messageData = docSnap.data();

      // Get attachments subcollection
      const attachmentsRef = collection(db, COLLECTION, commissionId, 'messages', docSnap.id, 'attachments');
      const attachmentsSnapshot = await getDocs(attachmentsRef);
      const attachments = attachmentsSnapshot.docs.map(a => ({
        id: a.id,
        ...a.data()
      })) as MessageAttachment[];

      messages.push({
        id: docSnap.id,
        ...messageData,
        attachments
      } as Message);
    }

    return messages;
  } catch (error) {
    console.error('Error fetching commission messages:', error);
    throw error;
  }
}

/**
 * Send a message with optional attachments
 */
export async function sendMessage(
  commissionId: string,
  content: string,
  attachmentFiles?: File[],
  senderId = 'customer'
): Promise<Message> {
  try {
    // Create the message
    const messagesRef = collection(db, COLLECTION, commissionId, 'messages');
    const messageDoc = await addDoc(messagesRef, {
      commission_id: commissionId,
      sender_id: senderId,
      content,
      is_read: false,
      created_at: serverTimestamp()
    });

    const attachments: MessageAttachment[] = [];

    // Upload and save attachments
    if (attachmentFiles && attachmentFiles.length > 0) {
      for (const file of attachmentFiles) {
        const fileUrl = await uploadCommissionFile(file, commissionId);

        const attachmentsRef = collection(
          db,
          COLLECTION,
          commissionId,
          'messages',
          messageDoc.id,
          'attachments'
        );

        const attachmentDoc = await addDoc(attachmentsRef, {
          message_id: messageDoc.id,
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          created_at: serverTimestamp()
        });

        attachments.push({
          id: attachmentDoc.id,
          message_id: messageDoc.id,
          file_url: fileUrl,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString()
        });
      }
    }

    return {
      id: messageDoc.id,
      commission_id: commissionId,
      sender_id: senderId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      attachments
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  commissionId: string,
  messageIds: string[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);

    for (const messageId of messageIds) {
      const messageRef = doc(db, COLLECTION, commissionId, 'messages', messageId);
      batch.update(messageRef, { is_read: true });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
}

/**
 * Get unread message count for a commission
 */
export async function getUnreadMessageCount(commissionId: string): Promise<number> {
  try {
    const messagesRef = collection(db, COLLECTION, commissionId, 'messages');
    const q = query(messagesRef, where('is_read', '==', false));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
}
