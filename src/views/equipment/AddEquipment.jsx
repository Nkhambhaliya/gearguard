import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEquipment } from '../../viewmodels/equipment.viewmodel';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const AddEquipment = () => {
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    department: '',
    purchaseDate: '',
    warranty: '',
    location: '',
    teamId: ''
  });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teams'));
      const teamsData = [];
      querySnapshot.forEach((doc) => {
        teamsData.push({ id: doc.id, ...doc.data() });
      });
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading teams:', error);
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

    const result = await addEquipment({
      ...formData,
      purchaseDate: new Date(formData.purchaseDate)
    });

    setLoading(false);

    if (result.success) {
      navigate('/equipment');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Equipment</h1>
        <p className="text-sm text-gray-500 mt-1">Register new equipment to your inventory</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Equipment Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="e.g., CNC Machine"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Serial Number *
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="e.g., SN-12345"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Department *
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="e.g., Manufacturing"
              required
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Purchase Date *
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">
              Warranty
            </label>
            <input
              type="text"
              name="warranty"
              value={formData.warranty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="e.g., 2 years"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="e.g., Building A, Floor 2"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Assigned Maintenance Team *
          </label>
          <select
            name="teamId"
            value={formData.teamId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
          >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
          >
            {loading ? 'Adding Equipment...' : 'Add Equipment'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/equipment')}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEquipment;
