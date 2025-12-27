import { useState } from 'react';
import { seedAllData } from '../services/seedData';

const SeedDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setMessage('');
    
    const result = await seedAllData();
    
    if (result.success) {
      setMessage('✅ Sample data created successfully! Refresh the page to see it.');
    } else {
      setMessage('❌ Error: ' + (result.error || 'Failed to create data'));
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Seeding...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Load Sample Data
          </>
        )}
      </button>
      {message && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-3 text-sm max-w-xs">
          {message}
        </div>
      )}
    </div>
  );
};

export default SeedDataButton;
