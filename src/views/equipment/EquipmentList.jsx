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
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-6"></div>
          <p className="text-gray-600 text-base font-medium">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Modern Header Section with Gradient */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Equipment Inventory
                </h1>
              </div>
              <p className="text-base text-gray-600 ml-1">
                Manage and track your equipment assets with ease
              </p>
            </div>
            <button
              onClick={() => navigate('/equipment/add')}
              className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add New Equipment
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area with Enhanced Spacing */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        {equipment.length === 0 ? (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl opacity-50"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-16 sm:p-20 text-center">
              <div className="max-w-lg mx-auto">
                <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl mb-8 shadow-xl">
                  <svg className="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">No Equipment Yet</h3>
                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                  Start building your inventory by adding your first piece of equipment. Track, manage, and maintain all your assets in one place.
                </p>
                <button
                  onClick={() => navigate('/equipment/add')}
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Equipment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
            {equipment.map((item) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-3xl transition-all duration-500 ${
                  item.isScrapped 
                    ? 'opacity-60' 
                    : 'hover:-translate-y-2 hover:scale-[1.02]'
                }`}
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40"></div>
                
                {/* Card Container */}
                <div className="relative bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200/60 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                  
                  {/* Status Badge - Floating */}
                  <div className="absolute top-6 right-6 z-10">
                    {item.isScrapped ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg uppercase tracking-wider">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Scrapped
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg uppercase tracking-wider">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Card Header */}
                  <div className="relative p-8 pb-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-3 pr-24">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                        <p className="text-xs text-gray-600 font-mono font-semibold">{item.serialNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8 space-y-6">
                    {/* Department */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                          Department
                        </p>
                        <p className="text-lg font-bold text-gray-900 truncate">
                          {item.department}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">
                          Location
                        </p>
                        <p className="text-lg font-bold text-gray-900 truncate">
                          {item.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-8 pt-6 space-y-4 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
                    <button
                      onClick={() => navigate(`/requests/create?equipmentId=${item.id}`)}
                      disabled={item.isScrapped}
                      className="w-full group/btn relative overflow-hidden flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                      <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="relative z-10">Request Maintenance ({maintenanceCounts[item.id] || 0})</span>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      {!item.isScrapped && (
                        <button
                          onClick={() => handleScrap(item.id)}
                          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-sm hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Scrap
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-sm hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                          !item.isScrapped ? '' : 'col-span-2'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentList;
