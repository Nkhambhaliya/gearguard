import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { RequestTypes, RequestStatus } from '../models/request.model';

export const seedAllData = async () => {
  try {
    console.log('🌱 Starting data seeding...');
    
    const teamIds = await seedTeams();
    if (teamIds.length === 0) {
      console.error('❌ Failed to create teams');
      return { success: false };
    }
    
    const equipmentIds = await seedEquipment(teamIds);
    if (equipmentIds.length === 0) {
      console.error('❌ Failed to create equipment');
      return { success: false };
    }
    
    await seedRequests(equipmentIds, teamIds);
    
    console.log('✅ All seed data created successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false, error: error.message };
  }
};

export const seedTeams = async () => {
  try {
    const existingTeams = await getDocs(collection(db, 'teams'));
    if (!existingTeams.empty) {
      console.log('ℹ️ Teams already exist, skipping...');
      return existingTeams.docs.map(doc => doc.id);
    }

    const teams = [
      { name: 'Mechanical Team', members: [], createdAt: new Date() },
      { name: 'Electrical Team', members: [], createdAt: new Date() },
      { name: 'HVAC Team', members: [], createdAt: new Date() },
      { name: 'IT Infrastructure Team', members: [], createdAt: new Date() }
    ];

    const teamIds = [];
    for (const team of teams) {
      const docRef = await addDoc(collection(db, 'teams'), team);
      teamIds.push(docRef.id);
      console.log(`✓ Created team: ${team.name}`);
    }

    return teamIds;
  } catch (error) {
    console.error('Error seeding teams:', error);
    return [];
  }
};

export const seedEquipment = async (teamIds) => {
  try {
    const existingEquipment = await getDocs(collection(db, 'equipment'));
    if (!existingEquipment.empty) {
      console.log('ℹ️ Equipment already exists, skipping...');
      return existingEquipment.docs.map(doc => doc.id);
    }

    const equipment = [
      {
        name: 'CNC Machine XR-500',
        serialNumber: 'CNC-2024-001',
        department: 'Manufacturing',
        purchaseDate: new Date('2023-06-15'),
        warranty: '3 years',
        location: 'Building A, Floor 2',
        teamId: teamIds[0],
        isScrapped: false,
        createdAt: new Date()
      },
      {
        name: 'Industrial Boiler',
        serialNumber: 'BLR-2024-045',
        department: 'Facilities',
        purchaseDate: new Date('2022-03-20'),
        warranty: '5 years',
        location: 'Building B, Basement',
        teamId: teamIds[0],
        isScrapped: false,
        createdAt: new Date()
      },
      {
        name: 'Power Distribution Unit',
        serialNumber: 'PDU-2024-089',
        department: 'Electrical',
        purchaseDate: new Date('2023-11-10'),
        warranty: '2 years',
        location: 'Building A, Server Room',
        teamId: teamIds[1],
        isScrapped: false,
        createdAt: new Date()
      },
      {
        name: 'Hydraulic Press HP-300',
        serialNumber: 'HYD-2024-012',
        department: 'Manufacturing',
        purchaseDate: new Date('2024-01-05'),
        warranty: '3 years',
        location: 'Building C, Floor 1',
        teamId: teamIds[0],
        isScrapped: false,
        createdAt: new Date()
      },
      {
        name: 'Air Conditioning Unit - Main',
        serialNumber: 'HVAC-2024-067',
        department: 'Facilities',
        purchaseDate: new Date('2023-08-12'),
        warranty: '4 years',
        location: 'Building A, Roof',
        teamId: teamIds[2],
        isScrapped: false,
        createdAt: new Date()
      }
    ];

    const equipmentIds = [];
    for (const item of equipment) {
      const docRef = await addDoc(collection(db, 'equipment'), item);
      equipmentIds.push(docRef.id);
      console.log(`✓ Created equipment: ${item.name}`);
    }

    return equipmentIds;
  } catch (error) {
    console.error('Error seeding equipment:', error);
    return [];
  }
};

export const seedRequests = async (equipmentIds, teamIds) => {
  try {
    const existingRequests = await getDocs(collection(db, 'requests'));
    if (!existingRequests.empty) {
      console.log('ℹ️ Requests already exist, skipping...');
      return;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const requests = [
      {
        subject: 'CNC Machine overheating issue',
        description: 'Machine temperature exceeds normal operating range during continuous operation. Needs inspection.',
        type: RequestTypes.CORRECTIVE,
        status: RequestStatus.PENDING,
        equipmentId: equipmentIds[0],
        teamId: teamIds[0],
        createdAt: today,
        duration: 0
      },
      {
        subject: 'Boiler pressure valve inspection',
        description: 'Regular quarterly inspection of safety valves and pressure gauges.',
        type: RequestTypes.PREVENTIVE,
        status: RequestStatus.IN_PROGRESS,
        equipmentId: equipmentIds[1],
        teamId: teamIds[0],
        scheduledDate: yesterday,
        createdAt: lastWeek,
        duration: 2
      },
      {
        subject: 'PDU circuit breaker replacement',
        description: 'Circuit breaker #4 showing signs of wear, needs replacement before failure.',
        type: RequestTypes.CORRECTIVE,
        status: RequestStatus.IN_PROGRESS,
        equipmentId: equipmentIds[2],
        teamId: teamIds[1],
        createdAt: yesterday,
        duration: 0
      },
      {
        subject: 'Hydraulic Press monthly maintenance',
        description: 'Routine oil change, filter replacement, and pressure system check.',
        type: RequestTypes.PREVENTIVE,
        status: RequestStatus.COMPLETED,
        equipmentId: equipmentIds[3],
        teamId: teamIds[0],
        scheduledDate: lastWeek,
        createdAt: new Date(lastWeek.getTime() - 86400000),
        duration: 3
      },
      {
        subject: 'HVAC filter replacement',
        description: 'Scheduled quarterly filter replacement and system efficiency check.',
        type: RequestTypes.PREVENTIVE,
        status: RequestStatus.PENDING,
        equipmentId: equipmentIds[4],
        teamId: teamIds[2],
        scheduledDate: nextWeek,
        createdAt: today,
        duration: 0
      },
      {
        subject: 'CNC coolant system leak',
        description: 'Small leak detected in coolant circulation system. Requires immediate attention.',
        type: RequestTypes.CORRECTIVE,
        status: RequestStatus.ON_HOLD,
        equipmentId: equipmentIds[0],
        teamId: teamIds[0],
        createdAt: yesterday,
        duration: 0
      }
    ];

    for (const request of requests) {
      await addDoc(collection(db, 'requests'), request);
      console.log(`✓ Created request: ${request.subject}`);
    }
  } catch (error) {
    console.error('Error seeding requests:', error);
  }
};
