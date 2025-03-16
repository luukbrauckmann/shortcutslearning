import { useState, useEffect } from 'react';
import { ChapterScores } from '../types';

export function useScores() {
  const [scores, setScores] = useState<ChapterScores>({});

  const loadScores = () => {
    const scoresStr = localStorage.getItem('chapterScores');
    if (scoresStr) {
      setScores(JSON.parse(scoresStr));
    }
  };

  const saveScore = (chapterId: string, newScore: number) => {
    const previousBest = scores[chapterId] || 0;
    if (newScore > previousBest) {
      const updatedScores = { ...scores, [chapterId]: newScore };
      localStorage.setItem('chapterScores', JSON.stringify(updatedScores));
      setScores(updatedScores);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  return { scores, saveScore, loadScores };
}