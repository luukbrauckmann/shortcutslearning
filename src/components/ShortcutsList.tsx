import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, BookOpen, ChevronDown, ChevronRight, FolderOpen, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Practice from './Practice';

interface Shortcut {
  id: string;
  shortcut: string;
  meaning: string;
}

interface Chapter {
  id: string;
  name: string;
  shortcuts: Shortcut[];
}

function ShortcutsList() {
  const { session } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [newShortcut, setNewShortcut] = useState({ shortcut: '', meaning: '', chapterId: '' });
  const [editForm, setEditForm] = useState({ shortcut: '', meaning: '' });
  const [editChapterForm, setEditChapterForm] = useState({ name: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [addingToChapter, setAddingToChapter] = useState<Chapter | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapterScores, setChapterScores] = useState<Record<string, number>>({});

  const loadScores = () => {
    const scoresStr = localStorage.getItem('chapterScores');
    if (scoresStr) {
      setChapterScores(JSON.parse(scoresStr));
    }
  };

  useEffect(() => {
    fetchChapters();
    loadScores();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .order('name');

      if (chaptersError) throw chaptersError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('chapter_items')
        .select(`
          chapter_id,
          shortcuts (
            id,
            shortcut,
            meaning
          )
        `);

      if (itemsError) throw itemsError;

      const regularChapters = chaptersData.map((chapter: any) => ({
        ...chapter,
        shortcuts: itemsData
          .filter((item: any) => item.chapter_id === chapter.id)
          .map((item: any) => item.shortcuts)
          .filter((shortcut: any) => shortcut !== null)
      }));

      const sortedChapters = regularChapters.sort((a, b) => {
        const aNum = parseInt(a.name.split(' ')[1]);
        const bNum = parseInt(b.name.split(' ')[1]);
        return aNum - bNum;
      });

      setChapters(sortedChapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setError('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      if (!newShortcut.shortcut || !newShortcut.meaning || !newShortcut.chapterId) {
        setError('All fields are required');
        return;
      }

      const { data: shortcutData, error: shortcutError } = await supabase
        .from('shortcuts')
        .insert([{
          shortcut: newShortcut.shortcut,
          meaning: newShortcut.meaning
        }])
        .select()
        .single();

      if (shortcutError) throw shortcutError;

      const { error: itemError } = await supabase
        .from('chapter_items')
        .insert([{
          chapter_id: newShortcut.chapterId,
          shortcut_id: shortcutData.id
        }]);

      if (itemError) throw itemError;

      closeAddForm();
      fetchChapters();
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
      fetchChapters();
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

      fetchChapters();
    } catch (error) {
      console.error('Error deleting shortcut:', error);
      setError('Failed to delete shortcut');
    }
  };

  const startEdit = (shortcut: Shortcut) => {
    setEditingId(shortcut.id);
    setEditForm({ shortcut: shortcut.shortcut, meaning: shortcut.meaning });
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openAddForm = (chapter: Chapter) => {
    setAddingToChapter(chapter);
    setNewShortcut(prev => ({ ...prev, chapterId: chapter.id }));
    setShowAddForm(true);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setAddingToChapter(null);
    setNewShortcut({ shortcut: '', meaning: '', chapterId: '' });
    setError(null);
  };

  const startPractice = (chapter?: Chapter) => {
    if (chapter) {
      setSelectedChapter(chapter);
    } else {
      const allShortcuts = chapters.reduce((acc, chapter) => [...acc, ...chapter.shortcuts], [] as Shortcut[]);
      setSelectedChapter({
        id: 'all',
        name: 'All Chapters',
        shortcuts: allShortcuts
      });
    }
    setPracticeMode(true);
  };

  const exitPractice = () => {
    setPracticeMode(false);
    setSelectedChapter(null);
    loadScores();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (practiceMode) {
    return <Practice chapter={selectedChapter} onExit={exitPractice} />;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={() => startPractice()}
        className="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 transition-colors text-lg font-medium flex items-center justify-center gap-2 mb-6"
      >
        <BookOpen size={24} />
        <span>Practice All Chapters</span>
      </button>

      <div className="space-y-4">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {expandedChapters[chapter.id] ? (
                    <ChevronDown size={24} />
                  ) : (
                    <ChevronRight size={24} />
                  )}
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={20} className="text-blue-500" />
                    <h2 className="text-lg font-semibold">{chapter.name}</h2>
                    <span className="text-sm text-gray-500">
                      ({chapter.shortcuts.length} shortcuts)
                    </span>
                  </div>
                  {chapterScores[chapter.id] !== undefined && (
                    <div 
                      className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full"
                      title="Best Score"
                    >
                      <Trophy size={16} className="text-yellow-500" />
                      <span className="font-medium text-yellow-700">
                        {chapterScores[chapter.id]}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {session && (
                  <button
                    onClick={() => openAddForm(chapter)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                )}
                <button
                  onClick={() => startPractice(chapter)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <BookOpen size={16} />
                  <span>Practice</span>
                </button>
              </div>
            </div>

            {expandedChapters[chapter.id] && (
              <div className="space-y-2 mt-4">
                {chapter.shortcuts.map((shortcut) => (
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
                        {session && (
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
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddForm && session && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium mb-4">
              Add New Shortcut to {addingToChapter?.name}
            </h3>
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
                  autoFocus
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
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={closeAddForm}
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
    </div>
  );
}

export default ShortcutsList;