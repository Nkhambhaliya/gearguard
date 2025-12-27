import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../../viewmodels/auth.viewmodel';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/equipment');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-6 py-8 animate-fade-in">
      <div className="max-w-lg w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl animate-bounce-subtle">
            <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GearGuard</h1>
          <p className="text-sm text-gray-600">Enterprise Equipment Management</p>
        </div>

        {/* Login Card */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50"></div>
          <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl p-8 animate-scale-in">
            <div className="text-center mb-8 space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome Back
              </h2>
              <p className="text-base text-gray-600">Sign in to manage your equipment</p>
            </div>
        
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-2xl mb-6 text-sm shadow-lg animate-slide-down">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-900 text-sm font-bold mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:border-gray-300 text-base font-medium"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-900 text-sm font-bold mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white hover:border-gray-300 text-base font-medium"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 px-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-base">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Secure equipment management system
        </p>
      </div>
    </div>
  );
};

export default Login;
