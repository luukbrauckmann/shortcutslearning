import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ShortcutsPage from './pages/ShortcutsPage';
import CollectionsPage from './pages/CollectionsPage';
import SignInPage from './pages/SignInPage';
import PracticePage from './pages/PracticePage';

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
            <Route path="/" element={<Navigate to="/shortcuts" replace />} />
            <Route path="/shortcuts" element={<ShortcutsPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/practice/:collectionId?" element={<PracticePage />} />
            <Route path="/signin" element={
              session ? <Navigate to="/shortcuts" replace /> : <SignInPage />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;