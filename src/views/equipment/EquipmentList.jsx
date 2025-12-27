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
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Equipment Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your equipment assets</p>
        </div>
        <button
          onClick={() => navigate('/equipment/add')}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Equipment
        </button>
      </div>

      {equipment.length === 0 ? (
        <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-2xl shadow-soft animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Equipment Found</h3>
          <p className="text-gray-500 mb-6">Add your first equipment to get started with inventory management</p>
          <button
            onClick={() => navigate('/equipment/add')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Equipment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 animate-fade-in">
          {equipment.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
                item.isScrapped ? 'opacity-60' : 'hover:-translate-y-1'
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-100">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{item.name}</h3>
                    <p className="text-xs text-gray-600 font-mono">{item.serialNumber}</p>
                  </div>
                  {item.isScrapped ? (
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-md border border-red-200 whitespace-nowrap">
                      SCRAPPED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md border border-green-200 whitespace-nowrap">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-4">
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Department</p>
                      <p className="text-sm text-gray-900 font-semibold truncate">{item.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Location</p>
                      <p className="text-sm text-gray-900 font-semibold truncate">{item.location}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/requests/create?equipmentId=${item.id}`)}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center gap-2"
                    disabled={item.isScrapped}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Request Maintenance ({maintenanceCounts[item.id] || 0})
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {!item.isScrapped && (
                      <button
                        onClick={() => handleScrap(item.id)}
                        className="px-3 py-2 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all duration-200 text-xs font-semibold border border-yellow-200"
                      >
                        ⚠️ Scrap
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className={`px-3 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 text-xs font-semibold border border-red-200 ${!item.isScrapped ? '' : 'col-span-2'}`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
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
