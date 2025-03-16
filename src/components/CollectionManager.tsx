import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Collection, Shortcut } from '../types';

interface Props {
  collection: Collection;
  allShortcuts: Shortcut[];
  onUpdate: () => void;
}

function CollectionManager({ collection, allShortcuts, onUpdate }: Props) {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [showShortcutSelector, setShowShortcutSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEditCollection = async () => {
    if (!session) {
      setError('You must be signed in to edit collections');
      return;
    }

    try {
      const { error } = await supabase
        .from('collections')
        .update({ name: editName })
        .eq('id', collection.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating collection:', error);
      setError('Failed to update collection');
    }
  };

  const handleDeleteCollection = async () => {
    if (!session) {
      setError('You must be signed in to delete collections');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collection.id);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error deleting collection:', error);
      setError('Failed to delete collection');
    }
  };

  const handleAddShortcut = async (shortcut: Shortcut) => {
    if (!session) {
      setError('You must be signed in to add shortcuts to collections');
      return;
    }

    try {
      const { error } = await supabase
        .from('collection_items')
        .insert({
          collection_id: collection.id,
          shortcut_id: shortcut.id
        });

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error adding shortcut:', error);
      setError('Failed to add shortcut');
    }
  };

  const handleRemoveShortcut = async (shortcutId: string) => {
    if (!session) {
      setError('You must be signed in to remove shortcuts from collections');
      return;
    }

    try {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', collection.id)
        .eq('shortcut_id', shortcutId);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error removing shortcut:', error);
      setError('Failed to remove shortcut');
    }
  };

  const filteredShortcuts = allShortcuts.filter(s => 
    !collection.shortcuts.some(cs => cs.id === s.id) &&
    (s.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.meaning.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="Collection name"
            />
            <button
              onClick={handleEditCollection}
              className="p-2 text-green-600 hover:text-green-700"
            >
              <Save size={20} />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 text-gray-600 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold">{collection.name}</h3>
            {session && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:text-blue-700"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={handleDeleteCollection}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setShowShortcutSelector(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Plus size={16} />
                  <span>Add Shortcuts</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showShortcutSelector && session && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add Shortcuts to {collection.name}</h3>
              <button
                onClick={() => setShowShortcutSelector(false)}
                className="p-2 text-gray-600 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full pl-10 pr-4 py-2 border rounded"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-2">
                {filteredShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-medium">{shortcut.shortcut}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="text-gray-600">{shortcut.meaning}</span>
                    </div>
                    <button
                      onClick={() => handleAddShortcut(shortcut)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {collection.shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
          >
            <div>
              <span className="font-medium">{shortcut.shortcut}</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-gray-600">{shortcut.meaning}</span>
            </div>
            {session && (
              <button
                onClick={() => handleRemoveShortcut(shortcut.id)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollectionManager;