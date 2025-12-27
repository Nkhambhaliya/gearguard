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
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 sm:gap-10">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                Equipment Inventory
              </h1>
              <p className="text-base sm:text-lg text-gray-600 font-normal mb-2">
                Manage and track your equipment assets
              </p>
            </div>
            <button
              onClick={() => navigate('/equipment/add')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Equipment
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 mt-20 sm:mt-24 lg:mt-28 pb-12 sm:pb-14 lg:pb-16 max-w-7xl">
        {equipment.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 sm:p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No equipment found</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Get started by adding your first piece of equipment to begin tracking your inventory.
              </p>
              <button
                onClick={() => navigate('/equipment/add')}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Equipment
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 lg:gap-10">
            {equipment.map((item) => (
              <div
                key={item.id}
                className={`group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
                  item.isScrapped 
                    ? 'opacity-50 grayscale' 
                    : 'hover:shadow-2xl hover:border-blue-200 hover:-translate-y-2'
                }`}
              >
                {/* Card Header */}
                <div className="p-7 sm:p-8 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug flex-1">
                      {item.name}
                    </h3>
                    {item.isScrapped ? (
                      <span className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-[11px] font-bold rounded-lg uppercase tracking-wide">
                        Scrapped
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-lg uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-gray-500 font-mono">{item.serialNumber}</p>
                </div>

                {/* Card Content */}
                <div className="p-7 sm:p-8 space-y-7">
                  {/* Department */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 pt-2">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Department
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        {item.department}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center ring-1 ring-purple-200/50">
                      <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 pt-2">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Location
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        {item.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-7 sm:p-8 pt-0 space-y-3.5">
                  <button
                    onClick={() => navigate(`/requests/create?equipmentId=${item.id}`)}
                    disabled={item.isScrapped}
                    className="w-full flex items-center justify-center gap-2.5 px-5 py-4 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Request Maintenance ({maintenanceCounts[item.id] || 0})
                  </button>

                  <div className="flex gap-3.5">
                    {!item.isScrapped && (
                      <button
                        onClick={() => handleScrap(item.id)}
                        className="flex-1 px-4 py-3 bg-yellow-50 text-yellow-700 rounded-xl font-semibold text-sm sm:text-base hover:bg-yellow-100 active:scale-98 transition-all duration-200 border border-yellow-200 hover:border-yellow-300"
                      >
                        Scrap
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className={`px-4 py-3 bg-red-50 text-red-700 rounded-xl font-semibold text-sm sm:text-base hover:bg-red-100 active:scale-98 transition-all duration-200 border border-red-200 hover:border-red-300 ${
                        !item.isScrapped ? 'flex-1' : 'w-full'
                      }`}
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
    </div>
  );
};

export default EquipmentList;
