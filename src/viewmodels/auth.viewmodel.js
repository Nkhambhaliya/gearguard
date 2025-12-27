import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { createUser } from '../models/user.model';

/**
 * Sign up new user
 * Creates Firebase Auth account and Firestore user document
 */
export const signUp = async (email, password, name, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    const userData = createUser(user.uid, name, email, role);
    await setDoc(doc(db, 'users', user.uid), userData);
    
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign in existing user
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      callback(userData);
    } else {
      callback(null);
    }
  });
};

/**
 * Get current user data
 */
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  return userDoc.exists() ? userDoc.data() : null;
};
