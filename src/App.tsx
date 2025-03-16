import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Practice from './components/Practice';
import Admin from './components/Admin';
import SignIn from './components/SignIn';
import SignUpComplete from './components/SignUpComplete';
import ProtectedRoute from './components/ProtectedRoute';
import { Shield } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

// Helper component to handle auth redirects
function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have auth parameters in the URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const type = params.get('type');

    if (token && (type === 'invite' || type === 'signup')) {
      // Redirect to signup completion with all original parameters
      navigate(`/signup/complete${location.search}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
}

function App() {
  const { session } = useAuth();

  return (
    <Router>
      <AuthRedirectHandler />
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Aviation Shortcuts</h1>
            {session ? (
              <div className="flex gap-4">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Shield size={20} />
                  <span>Admin</span>
                </Link>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
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

          <Routes>
            <Route path="/" element={<Practice />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup/complete" element={<SignUpComplete />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;