import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALXXCOBz4nhxThikpJ0BMmR7VuN4KHBeo",
  authDomain: "gearguard-a14f6.firebaseapp.com",
  projectId: "gearguard-a14f6",
  storageBucket: "gearguard-a14f6.firebasestorage.app",
  messagingSenderId: "1038430767362",
  appId: "1:1038430767362:web:3e49caff9d7ca1f7409a1b",
  measurementId: "G-KVWTGHD65X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export auth and firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
