
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addRequest, getTeamFromEquipment } from '../../viewmodels/request.viewmodel';
import { getAllEquipment } from '../../viewmodels/equipment.viewmodel';
import { RequestTypes } from '../../models/request.model';
import { useAuth } from '../../context/AuthContext';

const CreateRequest = () => {
  const [searchParams] = useSearchParams();
  const preSelectedEquipmentId = searchParams.get('equipmentId');
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipmentId: preSelectedEquipmentId || '',
    teamId: '',
    type: RequestTypes.CORRECTIVE,
    scheduledDate: ''
  });
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    // Auto-fill team when equipment is selected
    if (formData.equipmentId) {
      autoFillTeam(formData.equipmentId);
    }
  }, [formData.equipmentId]);

  const loadEquipment = async () => {
    const result = await getAllEquipment();
    if (result.success) {
      // Filter out scrapped equipment
      const activeEquipment = result.data.filter(e => !e.isScrapped);
      setEquipment(activeEquipment);
      
      // If pre-selected equipment, auto-fill team
      if (preSelectedEquipmentId) {
        autoFillTeam(preSelectedEquipmentId);
      }
    }
  };

  const autoFillTeam = async (equipmentId) => {
    const result = await getTeamFromEquipment(equipmentId);
    if (result.success) {
      setFormData(prev => ({
        ...prev,
        teamId: result.teamId
      }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate scheduled date for preventive maintenance
    if (formData.type === RequestTypes.PREVENTIVE && !formData.scheduledDate) {
      setError('Scheduled date is required for preventive maintenance');
      setLoading(false);
      return;
    }

    const requestData = {
      ...formData,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null
    };

    const result = await addRequest(requestData, currentUser.uid);

    setLoading(false);

    if (result.success) {
      navigate('/kanban');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 py-12">
      <div className="max-w-5xl mx-auto px-6 sm:px-10">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 bg-clip-text text-transparent">Create Maintenance Request</h1>
          </div>
          <p className="text-base text-gray-600 ml-1">Submit a new maintenance request for your equipment</p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-2xl mb-8 text-sm shadow-lg animate-slide-down">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 opacity-40"></div>
        <form onSubmit={handleSubmit} className="relative bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-200/50 p-10 sm:p-12 rounded-3xl space-y-8">
          
          {/* Section: Request Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
            </div>

            <div>
              <label className="block text-gray-900 text-sm font-bold mb-3">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base bg-white hover:border-gray-300 transition-all font-medium"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div>
              <label className="block text-gray-900 text-sm font-bold mb-3">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base bg-white hover:border-gray-300 transition-all resize-none font-medium"
                placeholder="Detailed description of the maintenance request"
              />
            </div>
          </div>

          {/* Section: Equipment Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Equipment</h2>
            </div>

            <div>
              <label className="block text-gray-900 text-sm font-bold mb-3">
                Equipment *
              </label>
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base bg-white hover:border-gray-300 transition-all appearance-none cursor-pointer font-medium"
                required
              >
                <option value="">Select equipment</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.serialNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Request Type */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Request Type</h2>
            </div>

            <div>
              <label className="block text-gray-900 text-sm font-bold mb-4">
                Request Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: RequestTypes.CORRECTIVE })}
                  className={`relative overflow-hidden px-6 py-6 rounded-2xl border-2 font-bold text-base transition-all transform hover:scale-105 ${
                    formData.type === RequestTypes.CORRECTIVE
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      formData.type === RequestTypes.CORRECTIVE
                        ? 'bg-blue-600 shadow-lg'
                        : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">{formData.type === RequestTypes.CORRECTIVE ? '🔧' : '🔧'}</span>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${
                        formData.type === RequestTypes.CORRECTIVE ? 'text-blue-900' : 'text-gray-700'
                      }`}>Corrective</div>
                      <div className="text-xs text-gray-500 mt-1">Fix issues</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: RequestTypes.PREVENTIVE })}
                  className={`relative overflow-hidden px-6 py-6 rounded-2xl border-2 font-bold text-base transition-all transform hover:scale-105 ${
                    formData.type === RequestTypes.PREVENTIVE
                      ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      formData.type === RequestTypes.PREVENTIVE
                        ? 'bg-purple-600 shadow-lg'
                        : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">{formData.type === RequestTypes.PREVENTIVE ? '🛡️' : '🛡️'}</span>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${
                        formData.type === RequestTypes.PREVENTIVE ? 'text-purple-900' : 'text-gray-700'
                      }`}>Preventive</div>
                      <div className="text-xs text-gray-500 mt-1">Scheduled</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {formData.type === RequestTypes.PREVENTIVE && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border-2 border-purple-200 animate-slide-down">
                <label className="block text-purple-900 text-sm font-bold mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-5 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base bg-white font-medium"
                  required={formData.type === RequestTypes.PREVENTIVE}
                />
              </div>
            )}
          </div>

          {/* Section: Team Assignment */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Team Assignment</h2>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border-2 border-gray-200">
              <label className="block text-gray-900 text-sm font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Assigned Team (Auto-filled)
              </label>
              <input
                type="text"
                value={formData.teamId || 'Select equipment first'}
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl bg-white text-gray-500 text-base cursor-not-allowed font-medium"
                disabled
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t-2 border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 px-8 rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create Request</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/kanban')}
              className="sm:flex-none px-8 py-5 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-bold text-lg border-2 border-gray-200 hover:border-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default CreateRequest;
