import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface Shortcut {
  id: string;
  shortcut: string;
  meaning: string;
}

function Admin() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newShortcut, setNewShortcut] = useState({ shortcut: '', meaning: '' });
  const [editForm, setEditForm] = useState({ shortcut: '', meaning: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShortcuts();
  }, []);

  const fetchShortcuts = async () => {
    try {
      const { data, error } = await supabase
        .from('shortcuts')
        .select('*')
        .order('shortcut');

      if (error) throw error;
      setShortcuts(data || []);
    } catch (error) {
      console.error('Error fetching shortcuts:', error);
      setError('Failed to load shortcuts');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      if (!newShortcut.shortcut || !newShortcut.meaning) {
        setError('Both shortcut and meaning are required');
        return;
      }

      const { error } = await supabase
        .from('shortcuts')
        .insert([newShortcut]);

      if (error) throw error;

      setNewShortcut({ shortcut: '', meaning: '' });
      setShowAddForm(false);
      setError(null);
      fetchShortcuts();
    } catch (error) {
      console.error('Error adding shortcut:', error);
      setError('Failed to add shortcut');
    }
  };

  const handleEdit = async (id: string) => {
    try {
      if (!editForm.shortcut || !editForm.meaning) {
        setError('Both shortcut and meaning are required');
        return;
      }

      const { error } = await supabase
        .from('shortcuts')
        .update(editForm)
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      setError(null);
      fetchShortcuts();
    } catch (error) {
      console.error('Error updating shortcut:', error);
      setError('Failed to update shortcut');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shortcuts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchShortcuts();
    } catch (error) {
      console.error('Error deleting shortcut:', error);
      setError('Failed to delete shortcut');
    }
  };

  const startEdit = (shortcut: Shortcut) => {
    setEditingId(shortcut.id);
    setEditForm({ shortcut: shortcut.shortcut, meaning: shortcut.meaning });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Shortcuts</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          disabled={showAddForm}
        >
          <Plus size={20} />
          <span>Add New</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
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
      )}

      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            {editingId === shortcut.id ? (
              <div className="flex-1 flex items-center gap-4">
                <input
                  type="text"
                  value={editForm.shortcut}
                  onChange={(e) => setEditForm(prev => ({ ...prev, shortcut: e.target.value }))}
                  className="w-32 p-2 border rounded"
                />
                <input
                  type="text"
                  value={editForm.meaning}
                  onChange={(e) => setEditForm(prev => ({ ...prev, meaning: e.target.value }))}
                  className="flex-1 p-2 border rounded"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(shortcut.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setError(null);
                    }}
                    className="p-1 text-gray-600 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <span className="font-medium">{shortcut.shortcut}</span>
                  <span className="mx-2 text-gray-400">→</span>
                  <span className="text-gray-600">{shortcut.meaning}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(shortcut)}
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;