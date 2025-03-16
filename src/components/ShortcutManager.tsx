import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Shortcut } from '../types';
import { validateShortcut } from '../lib/validation';
import { useAuth } from '../context/AuthContext';

interface Props {
  shortcuts: Shortcut[];
  onUpdate: () => void;
}

function ShortcutManager({ shortcuts, onUpdate }: Props) {
  const { session } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [newShortcut, setNewShortcut] = useState({ shortcut: '', meaning: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!session) {
      setError('You must be signed in to add shortcuts');
      return;
    }

    const validationError = validateShortcut(newShortcut);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('shortcuts')
        .insert([newShortcut]);

      if (insertError) throw insertError;

      setNewShortcut({ shortcut: '', meaning: '' });
      setShowAddForm(false);
      setError(null);
      onUpdate();
    } catch (error) {
      console.error('Error adding shortcut:', error);
      setError('Failed to add shortcut');
    }
  };

  const handleEdit = async (shortcut: Shortcut) => {
    if (!session) {
      setError('You must be signed in to edit shortcuts');
      return;
    }

    const validationError = validateShortcut(shortcut);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('shortcuts')
        .update({
          shortcut: shortcut.shortcut,
          meaning: shortcut.meaning
        })
        .eq('id', shortcut.id);

      if (updateError) throw updateError;

      setEditingShortcut(null);
      setError(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating shortcut:', error);
      setError('Failed to update shortcut');
    }
  };

  const handleDelete = async (id: string) => {
    if (!session) {
      setError('You must be signed in to delete shortcuts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this shortcut?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('shortcuts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      onUpdate();
    } catch (error) {
      console.error('Error deleting shortcut:', error);
      setError('Failed to delete shortcut');
    }
  };

  const filteredShortcuts = shortcuts.filter(s =>
    s.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shortcuts..."
            className="w-full pl-10 pr-4 py-2 border rounded"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        {session && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors sm:w-auto"
          >
            <Plus size={20} />
            <span>Add New Shortcut</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filteredShortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50"
          >
            <div className="flex-1">
              <span className="font-medium">{shortcut.shortcut}</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-gray-600">{shortcut.meaning}</span>
            </div>
            {session && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingShortcut(shortcut)}
                  className="p-1 text-blue-600 hover:text-blue-700"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(shortcut.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Shortcut Modal */}
      {showAddForm && session && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">Add New Shortcut</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shortcut
                </label>
                <input
                  type="text"
                  value={newShortcut.shortcut}
                  onChange={(e) => setNewShortcut(prev => ({ ...prev, shortcut: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="Enter shortcut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meaning
                </label>
                <input
                  type="text"
                  value={newShortcut.meaning}
                  onChange={(e) => setNewShortcut(prev => ({ ...prev, meaning: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="Enter meaning"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewShortcut({ shortcut: '', meaning: '' });
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add Shortcut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shortcut Modal */}
      {editingShortcut && session && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">Edit Shortcut</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shortcut
                </label>
                <input
                  type="text"
                  value={editingShortcut.shortcut}
                  onChange={(e) => setEditingShortcut(prev => ({ ...prev!, shortcut: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="Enter shortcut"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meaning
                </label>
                <input
                  type="text"
                  value={editingShortcut.meaning}
                  onChange={(e) => setEditingShortcut(prev => ({ ...prev!, meaning: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="Enter meaning"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingShortcut(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEdit(editingShortcut)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShortcutManager;