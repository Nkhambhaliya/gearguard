import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { signOutUser } from './viewmodels/auth.viewmodel';

// Auth Views
import Login from './views/auth/Login';
import Signup from './views/auth/Signup';

// Equipment Views
import EquipmentList from './views/equipment/EquipmentList';
import AddEquipment from './views/equipment/AddEquipment';

// Request Views
import CreateRequest from './views/requests/CreateRequest';
import KanbanBoard from './views/requests/KanbanBoard';

// Calendar View
import CalendarView from './views/calendar/CalendarView';
import SeedDataButton from './components/SeedDataButton';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Layout with Navigation
const Layout = ({ children }) => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    await signOutUser();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-center py-4">
            <Link to="/equipment" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">GearGuard</span>
            </Link>
            <div className="flex gap-6 items-center">
              <Link to="/equipment" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Equipment
              </Link>
              <Link to="/kanban" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Kanban
              </Link>
              <Link to="/calendar" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Calendar
              </Link>
              <Link to="/requests/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                + New Request
              </Link>
              <div className="border-l border-gray-200 pl-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{currentUser?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="pb-8">{children}</main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/equipment"
            element={
              <ProtectedRoute>
                <Layout>
                  <EquipmentList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment/add"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddEquipment />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateRequest />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <Layout>
                  <KanbanBoard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Layout>
                  <CalendarView />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/equipment" />} />
        </Routes>
        <SeedDataButton />
      </Router>
    </AuthProvider>
  );
}

export default App;
