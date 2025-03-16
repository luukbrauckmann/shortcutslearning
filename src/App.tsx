import React, { useState, useEffect } from 'react';
import { Plus, X, Check } from 'lucide-react';

interface Shortcut {
  id: string;
  shortcut: string;
  meaning: string;
}

const STORAGE_KEY = 'learning-shortcuts';

function App() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [newShortcut, setNewShortcut] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentShortcutIndex, setCurrentShortcutIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  }, [shortcuts]);

  const addShortcut = () => {
    if (newShortcut && newMeaning) {
      setShortcuts([
        ...shortcuts,
        {
          id: Date.now().toString(),
          shortcut: newShortcut,
          meaning: newMeaning,
        },
      ]);
      setNewShortcut('');
      setNewMeaning('');
    }
  };

  const deleteShortcut = (id: string) => {
    setShortcuts(shortcuts.filter((s) => s.id !== id));
  };

  const startPractice = () => {
    if (shortcuts.length > 0) {
      setPracticeMode(true);
      setCurrentShortcutIndex(0);
      setUserAnswer('');
      setShowResult(false);
    }
  };

  const checkAnswer = () => {
    setShowResult(true);
    if (userAnswer.toLowerCase() === shortcuts[currentShortcutIndex].meaning.toLowerCase()) {
      setTimeout(() => {
        setShowResult(false);
        setUserAnswer('');
        setCurrentShortcutIndex((prev) => 
          prev + 1 >= shortcuts.length ? 0 : prev + 1
        );
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Shortcut Learning App</h1>
        
        {!practiceMode ? (
          <div>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Add New Shortcut</h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="text"
                  value={newShortcut}
                  onChange={(e) => setNewShortcut(e.target.value)}
                  placeholder="Shortcut"
                  className="flex-1 p-2 border rounded text-base"
                />
                <input
                  type="text"
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="Meaning"
                  className="flex-1 p-2 border rounded text-base"
                />
                <button
                  onClick={addShortcut}
                  className="sm:w-auto w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <Plus size={20} className="sm:mr-0 mr-2" />
                  <span className="sm:hidden">Add Shortcut</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Shortcuts</h2>
              {shortcuts.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border-b last:border-b-0 gap-2 sm:gap-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-medium text-base">{item.shortcut}</span>
                    <span className="text-gray-500 hidden sm:inline">→</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                  <button
                    onClick={() => deleteShortcut(item.id)}
                    className="text-red-500 hover:text-red-600 self-end sm:self-center"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              {shortcuts.length === 0 && (
                <p className="text-gray-500 text-center py-4 text-base">
                  No shortcuts added yet. Add some above!
                </p>
              )}
            </div>

            <button
              onClick={startPractice}
              disabled={shortcuts.length === 0}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 text-base sm:text-lg"
            >
              Start Practice
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Practice Mode</h2>
            <div className="mb-6">
              <p className="text-base sm:text-lg mb-2">What does this shortcut mean?</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-4">
                {shortcuts[currentShortcutIndex].shortcut}
              </p>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="Type the meaning..."
                className="w-full p-3 border rounded mb-4 text-base"
                autoFocus
              />
              {showResult && (
                <div className={`text-center p-2 rounded ${
                  userAnswer.toLowerCase() === shortcuts[currentShortcutIndex].meaning.toLowerCase()
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {userAnswer.toLowerCase() === shortcuts[currentShortcutIndex].meaning.toLowerCase() ? (
                    <div className="flex items-center justify-center gap-2">
                      <Check size={20} />
                      <span>Correct!</span>
                    </div>
                  ) : (
                    <p>Try again!</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => setPracticeMode(false)}
                className="w-full sm:flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors text-base"
              >
                Exit Practice
              </button>
              <button
                onClick={checkAnswer}
                className="w-full sm:flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors text-base"
              >
                Check Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;