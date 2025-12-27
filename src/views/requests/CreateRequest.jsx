
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
    <div className="container mx-auto px-6 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Request</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new maintenance request</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Subject *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Detailed description of the maintenance request"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Equipment *
          </label>
          <select
            name="equipmentId"
            value={formData.equipmentId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Request Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
          >
            <option value={RequestTypes.CORRECTIVE}>{RequestTypes.CORRECTIVE}</option>
            <option value={RequestTypes.PREVENTIVE}>{RequestTypes.PREVENTIVE}</option>
          </select>
        </div>

        {formData.type === RequestTypes.PREVENTIVE && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Scheduled Date *
            </label>
            <input
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              required={formData.type === RequestTypes.PREVENTIVE}
            />
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Assigned Team (Auto-filled)
          </label>
          <input
            type="text"
            value={formData.teamId || 'Select equipment first'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-500 text-sm"
            disabled
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
          >
            {loading ? 'Creating...' : 'Create Request'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/kanban')}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;
