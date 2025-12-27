
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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Maintenance Request</h1>
        <p className="text-sm text-gray-500 mt-1">Submit a new maintenance request</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm animate-slide-down">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-soft p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-all"
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-all resize-none"
            placeholder="Detailed description of the maintenance request"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Equipment *
          </label>
          <select
            name="equipmentId"
            value={formData.equipmentId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-all appearance-none cursor-pointer"
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

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Request Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: RequestTypes.CORRECTIVE })}
              className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                formData.type === RequestTypes.CORRECTIVE
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              🔧 Corrective
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: RequestTypes.PREVENTIVE })}
              className={`px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                formData.type === RequestTypes.PREVENTIVE
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              🛡️ Preventive
            </button>
          </div>
        </div>

        {formData.type === RequestTypes.PREVENTIVE && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 animate-slide-down">
            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Scheduled Date *
            </label>
            <input
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              required={formData.type === RequestTypes.PREVENTIVE}
            />
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
          <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Assigned Team (Auto-filled)
          </label>
          <input
            type="text"
            value={formData.teamId || 'Select equipment first'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-500 text-sm cursor-not-allowed"
            disabled
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Request
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/kanban')}
            className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-3.5 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold border border-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;
