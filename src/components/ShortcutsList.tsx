import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, ChevronDown, ChevronRight, FolderOpen, FolderPlus, List, Folders } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Practice from './Practice';
import CollectionManager from './CollectionManager';
import ShortcutManager from './ShortcutManager';
import type { Collection, Shortcut } from '../types';

type Tab = 'shortcuts' | 'collections';

function ShortcutsList() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('shortcuts');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allShortcuts, setAllShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showAddCollectionForm, setShowAddCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all shortcuts
      const { data: shortcutsData, error: shortcutsError } = await supabase
        .from('shortcuts')
        .select('*')
        .order('shortcut');

      if (shortcutsError) throw shortcutsError;
      setAllShortcuts(shortcutsData);

      // Fetch collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .order('name');

      if (collectionsError) throw collectionsError;

      // Fetch collection items
      const { data: itemsData, error: itemsError } = await supabase
        .from('collection_items')
        .select(`
          collection_id,
          shortcuts (*)
        `);

      if (itemsError) throw itemsError;

      // Process collections
      const processedCollections = collectionsData.map((collection: any) => ({
        ...collection,
        shortcuts: itemsData
          .filter((item: any) => item.collection_id === collection.id)
          .map((item: any) => item.shortcuts)
          .filter((shortcut: any) => shortcut !== null)
      }));

      setCollections(processedCollections);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) {
      setError('Collection name is required');
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('collections')
        .insert([{ name: newCollectionName }]);

      if (insertError) throw insertError;

      setNewCollectionName('');
      setShowAddCollectionForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding collection:', error);
      setError('Failed to add collection');
    }
  };

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
  };

  const startPractice = (collection?: Collection) => {
    if (collection) {
      setSelectedCollection(collection);
    } else {
      setSelectedCollection({ id: 'all', name: 'All Shortcuts', shortcuts: allShortcuts });
    }
    setPracticeMode(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (practiceMode && selectedCollection) {
    return (
      <Practice
        shortcuts={selectedCollection.shortcuts}
        onExit={() => {
          setPracticeMode(false);
          setSelectedCollection(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'shortcuts'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List size={18} />
          <span>All Shortcuts</span>
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'collections'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Folders size={18} />
          <span>Collections</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'shortcuts' ? (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <List size={20} className="text-blue-500" />
              <h2 className="text-lg font-semibold">All Shortcuts</h2>
              <span className="text-sm text-gray-500">
                ({allShortcuts.length} shortcuts)
              </span>
            </div>
            <button
              onClick={() => startPractice()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <BookOpen size={18} />
              <span>Practice All</span>
            </button>
          </div>

          <ShortcutManager
            shortcuts={allShortcuts}
            onUpdate={fetchData}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {session && (
            <button
              onClick={() => setShowAddCollectionForm(true)}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <FolderPlus size={20} />
              <span>Create New Collection</span>
            </button>
          )}

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
                  onClick={() => startPractice(collection)}
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
                  onUpdate={fetchData}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {showAddCollectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">Create New Collection</h3>
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
                    setShowAddCollectionForm(false);
                    setNewCollectionName('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCollection}
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

export default ShortcutsList;