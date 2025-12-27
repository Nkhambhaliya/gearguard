import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { createRequest } from '../models/request.model';

/**
 * Create new maintenance request
 */
export const addRequest = async (requestData, currentUserId) => {
  try {
    const request = createRequest({
      ...requestData,
      createdBy: currentUserId
    });
    const docRef = await addDoc(collection(db, 'requests'), request);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get all requests
 */
export const getAllRequests = async () => {
  try {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get request by ID
 */
export const getRequestById = async (id) => {
  try {
    const docRef = doc(db, 'requests', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Request not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update request
 */
export const updateRequest = async (id, updates) => {
  try {
    const docRef = doc(db, 'requests', id);
    await updateDoc(docRef, updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Assign technician to request
 */
export const assignTechnician = async (requestId, technicianUid) => {
  try {
    const docRef = doc(db, 'requests', requestId);
    await updateDoc(docRef, { 
      assignedTo: technicianUid,
      status: 'In Progress'
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update request status
 */
export const updateRequestStatus = async (requestId, status) => {
  try {
    const docRef = doc(db, 'requests', requestId);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Set request duration (on completion)
 */
export const setRequestDuration = async (requestId, duration) => {
  try {
    const docRef = doc(db, 'requests', requestId);
    await updateDoc(docRef, { duration });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get team ID from equipment
 * Auto-fill logic for request creation
 */
export const getTeamFromEquipment = async (equipmentId) => {
  try {
    const docRef = doc(db, 'equipment', equipmentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, teamId: docSnap.data().teamId };
    } else {
      return { success: false, error: 'Equipment not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Listen to requests changes in realtime
 */
export const subscribeToRequests = (callback) => {
  const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    callback(requests);
  });
};
