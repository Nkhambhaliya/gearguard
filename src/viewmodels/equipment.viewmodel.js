import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { createEquipment } from '../models/equipment.model';

/**
 * Create new equipment
 */
export const addEquipment = async (equipmentData) => {
  try {
    const equipment = createEquipment(equipmentData);
    const docRef = await addDoc(collection(db, 'equipment'), equipment);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get all equipment
 */
export const getAllEquipment = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'equipment'));
    const equipment = [];
    querySnapshot.forEach((doc) => {
      equipment.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: equipment };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get equipment by ID
 */
export const getEquipmentById = async (id) => {
  try {
    const docRef = doc(db, 'equipment', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Equipment not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update equipment
 */
export const updateEquipment = async (id, updates) => {
  try {
    const docRef = doc(db, 'equipment', id);
    await updateDoc(docRef, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete equipment
 */
export const deleteEquipment = async (id) => {
  try {
    await deleteDoc(doc(db, 'equipment', id));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Mark equipment as scrapped
 */
export const scrapEquipment = async (id) => {
  try {
    const docRef = doc(db, 'equipment', id);
    await updateDoc(docRef, { isScrapped: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get maintenance count for equipment
 * Counts all requests for this equipment
 */
export const getMaintenanceCount = async (equipmentId) => {
  try {
    const q = query(
      collection(db, 'requests'),
      where('equipmentId', '==', equipmentId)
    );
    const querySnapshot = await getDocs(q);
    return { success: true, count: querySnapshot.size };
  } catch (error) {
    return { success: false, error: error.message, count: 0 };
  }
};

/**
 * Listen to equipment changes in realtime
 */
export const subscribeToEquipment = (callback) => {
  return onSnapshot(collection(db, 'equipment'), (snapshot) => {
    const equipment = [];
    snapshot.forEach((doc) => {
      equipment.push({ id: doc.id, ...doc.data() });
    });
    callback(equipment);
  });
};
