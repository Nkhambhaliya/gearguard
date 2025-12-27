export const RequestTypes = {
  CORRECTIVE: 'Corrective',
  PREVENTIVE: 'Preventive'
};

export const RequestStatus = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  REPAIRED: 'Repaired',
  SCRAP: 'Scrap'
};

/**
 * Request data structure
 * @typedef {Object} Request
 * @property {string} id - Unique request identifier
 * @property {string} subject - Request subject/title
 * @property {string} description - Detailed description
 * @property {string} equipmentId - Related equipment ID
 * @property {string} teamId - Assigned maintenance team ID
 * @property {string} type - Request type (Corrective | Preventive)
 * @property {string} status - Current status (New | In Progress | Repaired | Scrap)
 * @property {string} assignedTo - Assigned technician UID (optional)
 * @property {Date} scheduledDate - Scheduled date (for preventive maintenance)
 * @property {number} duration - Duration in hours (recorded on completion)
 * @property {Date} createdAt - Request creation timestamp
 * @property {string} createdBy - Creator user UID
 */

export const createRequest = (data) => ({
  subject: data.subject || '',
  description: data.description || '',
  equipmentId: data.equipmentId || '',
  teamId: data.teamId || '',
  type: data.type || RequestTypes.CORRECTIVE,
  status: RequestStatus.NEW,
  assignedTo: data.assignedTo || null,
  scheduledDate: data.scheduledDate || null,
  duration: 0,
  createdAt: new Date(),
  createdBy: data.createdBy || ''
});
