import React, { useState, useEffect } from 'react';
import { Check, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface AnswerAttempt {
  shortcut: string;
  meaning: string;
  userAnswer: string;
  isCorrect: boolean;
}

interface PracticeProps {
  chapter?: Chapter | null;
  onExit: () => void;
}

function Practice({ chapter, onExit }: PracticeProps) {
  const [currentShortcutIndex, setCurrentShortcutIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [practiceShortcuts, setPracticeShortcuts] = useState<Shortcut[]>([]);
  const [answerAttempts, setAnswerAttempts] = useState<AnswerAttempt[]>([]);
  const [showOverview, setShowOverview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chapter) {
      setPracticeShortcuts(shuffleArray(chapter.shortcuts));
      setLoading(false);
    } else {
      fetchAllShortcuts();
    }
  }, [chapter]);

  const fetchAllShortcuts = async () => {
    try {
      const { data, error } = await supabase
        .from('shortcuts')
        .select('*')
        .order('shortcut');

      if (error) throw error;
      setPracticeShortcuts(shuffleArray(data || []));
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

  const saveScore = () => {
    if (!chapter || chapter.id === 'all') return;

    const correctAnswers = answerAttempts.filter(a => a.isCorrect).length;
    const totalQuestions = answerAttempts.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const scoresStr = localStorage.getItem('chapterScores');
    const scores = scoresStr ? JSON.parse(scoresStr) : {};

    const previousBest = scores[chapter.id] || 0;
    if (score > previousBest) {
      scores[chapter.id] = score;
      localStorage.setItem('chapterScores', JSON.stringify(scores));
    }
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
      saveScore();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (showOverview) {
    const correctAnswers = answerAttempts.filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / answerAttempts.length) * 100);

    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            <span>Back to Chapters</span>
          </button>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Practice Results</h2>
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-xl font-semibold mb-2">Your Score: {score}%</p>
            <p className="text-gray-600">
              You got {correctAnswers} out of {answerAttempts.length} questions correct
            </p>
          </div>
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
          onClick={onExit}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Chapters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          <span>Back to Chapters</span>
        </button>
      </div>
      <h2 className="text-lg sm:text-xl font-semibold mb-4">
        Practice Mode {chapter && `- ${chapter.name}`}
      </h2>
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
        {/* Reserved space for result message with min-height */}
        <div className="min-h-[80px] mb-4">
          {showResult && (
            <div className={`text-center p-3 rounded ${
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
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {!showResult ? (
          <>
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
          <button
            onClick={moveToNext}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors text-base"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}

export default Practice;