export const createEquipment = (data) => ({
  name: data.name || '',
  serialNumber: data.serialNumber || '',
  department: data.department || '',
  purchaseDate: data.purchaseDate || new Date(),
  warranty: data.warranty || '',
  location: data.location || '',
  teamId: data.teamId || '',
  isScrapped: false,
  createdAt: new Date()
});
