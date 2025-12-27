/**
 * Team Model
 * Represents a maintenance team with assigned members
 * 
 * Firestore Collection: teams
 */

/**
 * Team data structure
 * @typedef {Object} Team
 * @property {string} id - Unique team identifier
 * @property {string} name - Team name
 * @property {string[]} members - Array of user UIDs assigned to this team
 * @property {Date} createdAt - Team creation timestamp
 */

export const createTeam = (name, members = []) => ({
  name,
  members,
  createdAt: new Date()
});
