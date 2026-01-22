import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// TODO: Replace with your Firebase project configuration
// Get this from Firebase Console -> Project Settings -> General -> Your apps -> Firebase SDK snippet
const firebaseConfig = {
  apiKey: "AIzaSyDpKhaikvXgQxldl_v8Us-YMdBKaaijEv4",
  authDomain: "hollow-log-studios-new.firebaseapp.com",
  projectId: "hollow-log-studios-new",
  storageBucket: "hollow-log-studios-new.firebasestorage.app",
  messagingSenderId: "930238695043",
  appId: "1:930238695043:web:c5bfb196175c50d13b7db6",
  measurementId: "G-7GVGB0FDCT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Analytics can fail in development, so initialize it safely
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log('Analytics not available in this environment');
}
export { analytics };

export default app;
