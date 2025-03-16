import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ShortcutsList from './components/ShortcutsList';
import SignIn from './components/SignIn';
import { Shield } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';

function Navigation() {
  const { session } = useAuth();

  return (
    <div className="flex justify-between items-center mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Aviation Shortcuts</h1>
      <div className="flex items-center gap-3">
        {session ? (
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        ) : (
          <Link
            to="/signin"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Shield size={20} />
            <span>Admin Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
}

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <Navigation />
          <Routes>
            <Route path="/" element={<ShortcutsList />} />
            <Route path="/signin" element={
              session ? <Navigate to="/" replace /> : <SignIn />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;