import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
  User as FirebaseUser,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './config';
import { User } from '@/types';

const ensureUserProfile = async (uid: string, email: string): Promise<User> => {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data() as User;
    if (email.includes('@hollowlogstudios.com') && !userData.is_admin) {
      await updateDoc(userRef, { is_admin: true });
      return { id: uid, ...userData, is_admin: true } as User;
    }
    return { id: uid, ...userData } as User;
  }

  const newUser: Omit<User, 'id'> = {
    email,
    first_name: email.split('@')[0],
    last_name: '',
    is_admin: email.includes('@hollowlogstudios.com'),
    created_at: serverTimestamp() as any,
    updated_at: serverTimestamp() as any
  };

  await setDoc(userRef, newUser);
  return { id: uid, ...newUser } as User;
};

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email: string, password: string): Promise<{ user: User | null; error: any }> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const user = await ensureUserProfile(userCredential.user.uid, email);
    return { user, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { user: null, error };
  }
};

/**
 * Register a new user
 */
export const register = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ user: User | null; error: any }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const newUser: Omit<User, 'id'> = {
      email,
      first_name: firstName,
      last_name: lastName,
      is_admin: email.includes('@hollowlogstudios.com'),
      created_at: serverTimestamp() as any,
      updated_at: serverTimestamp() as any
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    return { user: { id: userCredential.user.uid, ...newUser } as User, error: null };
  } catch (error) {
    console.error('Error registering:', error);
    return { user: null, error };
  }
};

/**
 * Send a magic sign-in link via email
 */
export const sendMagicLink = async (
  email: string,
  redirectUrl: string
): Promise<{ error: any }> => {
  try {
    await sendSignInLinkToEmail(auth, email, {
      url: redirectUrl,
      handleCodeInApp: true
    });
    return { error: null };
  } catch (error) {
    console.error('Error sending magic link:', error);
    return { error };
  }
};

/**
 * Complete magic link sign-in
 */
export const signInWithMagicLink = async (
  email: string,
  link: string
): Promise<{ user: User | null; error: any }> => {
  try {
    const userCredential = await signInWithEmailLink(auth, email, link);
    const user = await ensureUserProfile(userCredential.user.uid, email);
    return { user, error: null };
  } catch (error) {
    console.error('Error signing in with magic link:', error);
    return { user: null, error };
  }
};

export const isMagicLink = (link: string) => isSignInWithEmailLink(auth, link);

/**
 * Sign out current user
 */
export const logout = async (): Promise<{ error: any }> => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string): Promise<{ error: any }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { error };
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<{ user: User | null; error: any }> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return { user: null, error: null };
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      return { user: { id: userDoc.id, ...userDoc.data() } as User, error: null };
    }

    return { user: null, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, error };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get Firebase auth current user
 */
export const getFirebaseUser = () => auth.currentUser;
