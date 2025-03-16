import React from 'react';
import { BookOpen, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShortcutManager from '../components/ShortcutManager';
import { useShortcuts } from '../hooks/useShortcuts';
import LoadingSpinner from '../components/LoadingSpinner';

function ShortcutsPage() {
  const navigate = useNavigate();
  const { shortcuts, loading, error, refetch } = useShortcuts();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <List size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold">All Shortcuts</h2>
          <span className="text-sm text-gray-500">
            ({shortcuts.length} shortcuts)
          </span>
        </div>
        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <BookOpen size={18} />
          <span>Practice All</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <ShortcutManager
        shortcuts={shortcuts}
        onUpdate={refetch}
      />
    </div>
  );
}

export default ShortcutsPage