import { 
  collection, 
  getDocs, 
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { updateRequestStatus, assignTechnician, setRequestDuration } from './request.viewmodel';
import { RequestStatus } from '../models/request.model';

/**
 * Get requests grouped by status (for kanban columns)
 */
export const getKanbanRequests = async () => {
  try {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const grouped = {
      [RequestStatus.NEW]: [],
      [RequestStatus.IN_PROGRESS]: [],
      [RequestStatus.REPAIRED]: [],
      [RequestStatus.SCRAP]: []
    };
    
    querySnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      if (grouped[data.status]) {
        grouped[data.status].push(data);
      }
    });
    
    return { success: true, data: grouped };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Move request to different status column
 */
export const moveRequest = async (requestId, newStatus) => {
  return await updateRequestStatus(requestId, newStatus);
};

/**
 * Assign technician to request and move to In Progress
 */
export const assignToSelf = async (requestId, technicianUid) => {
  return await assignTechnician(requestId, technicianUid);
};

/**
 * Complete request with duration
 */
export const completeRequest = async (requestId, duration) => {
  const statusResult = await updateRequestStatus(requestId, RequestStatus.REPAIRED);
  if (statusResult.success && duration) {
    await setRequestDuration(requestId, duration);
  }
  return statusResult;
};

/**
 * Check if request is overdue
 * Returns true if scheduled date has passed and status is not Repaired/Scrap
 */
export const isRequestOverdue = (request) => {
  if (!request.scheduledDate) return false;
  
  const now = new Date();
  const scheduledDate = request.scheduledDate.toDate ? request.scheduledDate.toDate() : new Date(request.scheduledDate);
  
  return (
    scheduledDate < now && 
    request.status !== RequestStatus.REPAIRED &&
    request.status !== RequestStatus.SCRAP
  );
};

/**
 * Subscribe to kanban updates in realtime
 */
export const subscribeToKanban = (callback) => {
  const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const grouped = {
      [RequestStatus.NEW]: [],
      [RequestStatus.IN_PROGRESS]: [],
      [RequestStatus.REPAIRED]: [],
      [RequestStatus.SCRAP]: []
    };
    
    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      if (grouped[data.status]) {
        grouped[data.status].push(data);
      }
    });
    
    callback(grouped);
  });
};

/**
 * Get user details for assigned technician
 */
export const getTechnicianInfo = async (uid) => {
  try {
    const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
    if (!userDoc.empty) {
      return { success: true, data: userDoc.docs[0].data() };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
