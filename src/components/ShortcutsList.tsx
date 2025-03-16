import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, BookOpen, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Shortcut {
  id: string;
  shortcut: string;
  meaning: string;
}

function ShortcutsList() {
  const { session } = useAuth();
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newShortcut, setNewShortcut] = useState({ shortcut: '', meaning: '' });
  const [editForm, setEditForm] = useState({ shortcut: '', meaning: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentShortcutIndex, setCurrentShortcutIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [answerAttempts, setAnswerAttempts] = useState<Array<{
    shortcut: string;
    meaning: string;
    userAnswer: string;
    isCorrect: boolean;
  }>>([]);
  const [showOverview, setShowOverview] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);

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

  const startPractice = () => {
    setPracticeMode(true);
    setCurrentShortcutIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setAnswerAttempts([]);
    setShowOverview(false);
    const shuffled = [...shortcuts].sort(() => Math.random() - 0.5);
    setShortcuts(shuffled);
  };

  const checkAnswer = () => {
    const currentShortcut = shortcuts[currentShortcutIndex];
    const isCorrect = userAnswer.trim().toLowerCase() === currentShortcut.meaning.trim().toLowerCase();
    
    setAnswerAttempts(prev => [...prev, {
      shortcut: currentShortcut.shortcut,
      meaning: currentShortcut.meaning,
      userAnswer: userAnswer,
      isCorrect: isCorrect
    }]);

    setShowResult(true);
  };

  const moveToNext = () => {
    setShowResult(false);
    setUserAnswer('');
    if (currentShortcutIndex + 1 >= shortcuts.length) {
      setShowOverview(true);
    } else {
      setCurrentShortcutIndex(prev => prev + 1);
    }
  };

  const handleDontKnow = () => {
    const currentShortcut = shortcuts[currentShortcutIndex];
    setAnswerAttempts(prev => [...prev, {
      shortcut: currentShortcut.shortcut,
      meaning: currentShortcut.meaning,
      userAnswer: "I don't know",
      isCorrect: false
    }]);
    setShowResult(true);
  };

  const resetPractice = () => {
    setPracticeMode(false);
    setShowOverview(false);
    setAnswerAttempts([]);
    fetchShortcuts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (practiceMode) {
    if (showOverview) {
      return (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Practice Results</h2>
          <div className="mb-6">
            <p className="text-base mb-4">
              You completed {answerAttempts.length} questions with{' '}
              {answerAttempts.filter(a => a.isCorrect).length} correct answers.
            </p>
            <div className="space-y-4">
              {answerAttempts.map((attempt, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    attempt.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {attempt.isCorrect ? (
                      <Check className="text-green-600" size={20} />
                    ) : (
                      <X className="text-red-600" size={20} />
                    )}
                    <span className="font-semibold">{attempt.shortcut}</span>
                  </div>
                  <p className="text-gray-600">Correct: {attempt.meaning}</p>
                  {!attempt.isCorrect && (
                    <p className="text-red-600 mt-1">Your answer: {attempt.userAnswer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={resetPractice}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to List
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Practice Mode</h2>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-base sm:text-lg">What does this shortcut mean?</p>
            <p className="text-sm text-gray-500">
              {currentShortcutIndex + 1} of {shortcuts.length}
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-4">
            {shortcuts[currentShortcutIndex].shortcut}
          </p>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !showResult && checkAnswer()}
            placeholder="Type the meaning..."
            className="w-full p-3 border rounded mb-4 text-base"
            disabled={showResult}
            autoFocus
            autoComplete="off"
          />
          {showResult && (
            <div className={`text-center p-3 rounded mb-4 ${
              userAnswer.trim().toLowerCase() === shortcuts[currentShortcutIndex].meaning.trim().toLowerCase()
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {userAnswer.trim().toLowerCase() === shortcuts[currentShortcutIndex].meaning.trim().toLowerCase() ? (
                <div className="flex items-center justify-center gap-2">
                  <Check size={20} />
                  <span>Correct!</span>
                </div>
              ) : (
                <div>
                  <p className="mb-2">Incorrect</p>
                  <p className="text-sm">
                    The correct answer is: {shortcuts[currentShortcutIndex].meaning}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {!showResult ? (
            <>
              <button
                onClick={resetPractice}
                className="w-full sm:flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors text-base"
              >
                Exit Practice
              </button>
              <button
                onClick={handleDontKnow}
                className="w-full sm:flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition-colors text-base"
              >
                I don't know
              </button>
              <button
                onClick={checkAnswer}
                className="w-full sm:flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors text-base"
              >
                Check Answer
              </button>
            </>
          ) : (
            <>
              <button
                onClick={resetPractice}
                className="w-full sm:flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors text-base"
              >
                Exit Practice
              </button>
              <button
                onClick={moveToNext}
                className="w-full sm:flex-[2] bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors text-base"
              >
                Next Question
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsListExpanded(!isListExpanded)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isListExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
            </button>
            <h2 className="text-xl font-semibold">Aviation Shortcuts</h2>
            <span className="ml-2 text-sm text-gray-500">({shortcuts.length} total)</span>
          </div>
          {session && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              disabled={showAddForm}
            >
              <Plus size={20} />
              <span>Add New</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {showAddForm && session && (
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

        {isListExpanded && (
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                {editingId === shortcut.id && session ? (
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

      <button
        onClick={startPractice}
        className="w-full bg-green-500 text-white py-4 rounded-lg hover:bg-green-600 transition-colors text-lg font-medium flex items-center justify-center gap-2"
      >
        <BookOpen size={24} />
        <span>Start Practice</span>
      </button>
    </div>
  );
}

export default ShortcutsList;