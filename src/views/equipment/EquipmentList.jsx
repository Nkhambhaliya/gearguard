import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllEquipment, 
  deleteEquipment, 
  scrapEquipment,
  getMaintenanceCount 
} from '../../viewmodels/equipment.viewmodel';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceCounts, setMaintenanceCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    const result = await getAllEquipment();
    
    if (result.success) {
      setEquipment(result.data);
      
      // Load maintenance counts for each equipment
      const counts = {};
      for (const item of result.data) {
        const countResult = await getMaintenanceCount(item.id);
        counts[item.id] = countResult.count;
      }
      setMaintenanceCounts(counts);
    }
    
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      const result = await deleteEquipment(id);
      if (result.success) {
        loadEquipment();
      }
    }
  };

  const handleScrap = async (id) => {
    if (window.confirm('Mark this equipment as scrapped?')) {
      const result = await scrapEquipment(id);
      if (result.success) {
        loadEquipment();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your equipment inventory</p>
        </div>
        <button
          onClick={() => navigate('/equipment/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Equipment
        </button>
      </div>

      {equipment.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 text-lg">No equipment found. Add your first equipment to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow hover:shadow-md transition-shadow p-6 ${item.isScrapped ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.serialNumber}</p>
                </div>
                {item.isScrapped ? (
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                    Scrapped
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center text-sm">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700 font-medium">{item.department}</span>
                  </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/requests/create?equipmentId=${item.id}`)}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={item.isScrapped}
                >
                  Request Maintenance ({maintenanceCounts[item.id] || 0})
                </button>
                <div className="flex gap-2">
                  {!item.isScrapped && (
                    <button
                      onClick={() => handleScrap(item.id)}
                      className="flex-1 px-3 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors text-sm"
                    >
                      Scrap
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
