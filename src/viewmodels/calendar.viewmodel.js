import { 
  collection, 
  getDocs, 
  query,
  where
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { RequestTypes } from '../models/request.model';

/**
 * Get preventive maintenance tasks for calendar view
 */
export const getPreventiveMaintenanceTasks = async () => {
  try {
    const q = query(
      collection(db, 'requests'),
      where('type', '==', RequestTypes.PREVENTIVE)
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      if (data.scheduledDate) {
        tasks.push(data);
      }
    });
    
    return { success: true, data: tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get tasks for a specific date
 */
export const getTasksForDate = (tasks, date) => {
  return tasks.filter(task => {
    if (!task.scheduledDate) return false;
    
    const taskDate = task.scheduledDate.toDate ? 
      task.scheduledDate.toDate() : 
      new Date(task.scheduledDate);
    
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    );
  });
};

/**
 * Group tasks by date for calendar display
 */
export const groupTasksByDate = (tasks) => {
  const grouped = {};
  
  tasks.forEach(task => {
    if (!task.scheduledDate) return;
    
    const date = task.scheduledDate.toDate ? 
      task.scheduledDate.toDate() : 
      new Date(task.scheduledDate);
    
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(task);
  });
  
  return grouped;
};
