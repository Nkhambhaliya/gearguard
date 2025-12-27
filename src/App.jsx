import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
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
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Layout with Navigation
const Layout = ({ children }) => {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <Link to="/equipment" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-105">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GearGuard</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-1 items-center">
              <Link to="/equipment" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200">
                Equipment
              </Link>
              <Link to="/kanban" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200">
                Kanban
              </Link>
              <Link to="/calendar" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200">
                Calendar
              </Link>
              <Link to="/requests/create" className="ml-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Request
              </Link>
              <div className="border-l border-gray-200 pl-4 ml-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {currentUser?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 animate-slide-down">
              <div className="flex flex-col space-y-2">
                <Link to="/equipment" className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                  📦 Equipment
                </Link>
                <Link to="/kanban" className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                  📋 Kanban Board
                </Link>
                <Link to="/calendar" className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                  📅 Calendar
                </Link>
                <Link to="/requests/create" className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-lg text-center" onClick={() => setMobileMenuOpen(false)}>
                  + New Request
                </Link>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                      {currentUser?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-left"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="pb-8 animate-fade-in">{children}</main>
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
