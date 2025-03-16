import React, { useState } from 'react';
import { FolderPlus, BookOpen, ChevronDown, ChevronRight, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import { useShortcuts } from '../hooks/useShortcuts';
import { useAuth } from '../context/AuthContext';
import CollectionManager from '../components/CollectionManager';
import LoadingSpinner from '../components/LoadingSpinner';

function CollectionsPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { collections, loading: collectionsLoading, error, refetch } = useCollections();
  const { shortcuts: allShortcuts, loading: shortcutsLoading } = useShortcuts();
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
  };

  const startPractice = (collectionId: string) => {
    navigate(`/practice/${collectionId}`);
  };

  if (collectionsLoading || shortcutsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {session && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <FolderPlus size={20} />
          <span>Create New Collection</span>
        </button>
      )}

      <div className="space-y-4">
        {collections.map((collection) => (
          <div key={collection.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCollection(collection.id)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {expandedCollections[collection.id] ? (
                    <ChevronDown size={24} />
                  ) : (
                    <ChevronRight size={24} />
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <FolderOpen size={20} className="text-blue-500" />
                  <h2 className="text-lg font-semibold">{collection.name}</h2>
                  <span className="text-sm text-gray-500">
                    ({collection.shortcuts.length} shortcuts)
                  </span>
                </div>
              </div>
              <button
                onClick={() => startPractice(collection.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <BookOpen size={18} />
                <span>Practice</span>
              </button>
            </div>

            {expandedCollections[collection.id] && (
              <CollectionManager
                collection={collection}
                allShortcuts={allShortcuts}
                onUpdate={refetch}
              />
            )}
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">Create New Collection</h3>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {formError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter collection name"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCollectionName('');
                    setFormError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newCollectionName.trim()) {
                      setFormError('Collection name is required');
                      return;
                    }
                    setShowAddForm(false);
                    setNewCollectionName('');
                    setFormError(null);
                    refetch();
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Create Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollectionsPage;