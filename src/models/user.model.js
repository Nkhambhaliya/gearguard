export const UserRoles = {
  MANAGER: 'manager',
  TECHNICIAN: 'technician'
};

/**
 * User data structure
 * @typedef {Object} User
 * @property {string} uid - Firebase Auth user ID
 * @property {string} name - User's display name
 * @property {string} email - User's email address
 * @property {string} role - User role (manager | technician)
 * @property {Date} createdAt - Account creation timestamp
 */

export const createUser = (uid, name, email, role) => ({
  uid,
  name,
  email,
  role: role || UserRoles.TECHNICIAN,
  createdAt: new Date()
});
