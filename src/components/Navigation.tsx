import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, List, Folders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

function Navigation() {
  const { session } = useAuth();
  const location = useLocation();

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
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

      <div className="flex border-b">
        <Link
          to="/shortcuts"
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
            location.pathname === '/shortcuts'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List size={18} />
          <span>All Shortcuts</span>
        </Link>
        <Link
          to="/collections"
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
            location.pathname === '/collections'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Folders size={18} />
          <span>Collections</span>
        </Link>
      </div>
    </div>
  );
}

export default Navigation