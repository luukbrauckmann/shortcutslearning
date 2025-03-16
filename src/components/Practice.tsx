import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Shortcut {
  id: string;
  shortcut: string;
  meaning: string;
}

interface AnswerAttempt {
  shortcut: string;
  meaning: string;
  userAnswer: string;
  isCorrect: boolean;
}

function Practice() {
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentShortcutIndex, setCurrentShortcutIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [practiceShortcuts, setPracticeShortcuts] = useState<Shortcut[]>([]);
  const [answerAttempts, setAnswerAttempts] = useState<AnswerAttempt[]>([]);
  const [showOverview, setShowOverview] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setPracticeShortcuts(data || []);
    } catch (error) {
      console.error('Error fetching shortcuts:', error);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array: Shortcut[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startPractice = () => {
    setPracticeMode(true);
    setCurrentShortcutIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setAnswerAttempts([]);
    setShowOverview(false);
    setPracticeShortcuts(shuffleArray(practiceShortcuts));
  };

  const checkAnswer = () => {
    const currentShortcut = practiceShortcuts[currentShortcutIndex];
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
    if (currentShortcutIndex + 1 >= practiceShortcuts.length) {
      setShowOverview(true);
    } else {
      setCurrentShortcutIndex(prev => prev + 1);
    }
  };

  const handleDontKnow = () => {
    const currentShortcut = practiceShortcuts[currentShortcutIndex];
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!practiceMode) {
    return (
      <div>
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Available Shortcuts</h2>
          <div className="grid gap-2">
            {practiceShortcuts.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center p-3 border-b last:border-b-0 gap-1 sm:gap-2"
              >
                <span className="font-medium text-base w-24">{item.shortcut}</span>
                <span className="text-gray-500 hidden sm:inline">→</span>
                <span className="text-gray-600">{item.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startPractice}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors text-base sm:text-lg"
        >
          Start Practice
        </button>
      </div>
    );
  }

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
          Back to Home
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
            {currentShortcutIndex + 1} of {practiceShortcuts.length}
          </p>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-4">
          {practiceShortcuts[currentShortcutIndex].shortcut}
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
            userAnswer.trim().toLowerCase() === practiceShortcuts[currentShortcutIndex].meaning.trim().toLowerCase()
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {userAnswer.trim().toLowerCase() === practiceShortcuts[currentShortcutIndex].meaning.trim().toLowerCase() ? (
              <div className="flex items-center justify-center gap-2">
                <Check size={20} />
                <span>Correct!</span>
              </div>
            ) : (
              <div>
                <p className="mb-2">Incorrect</p>
                <p className="text-sm">
                  The correct answer is: {practiceShortcuts[currentShortcutIndex].meaning}
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

export default Practice;