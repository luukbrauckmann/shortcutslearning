import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Chapter } from '../types';

export function useChapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      setError(null);

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

  useEffect(() => {
    fetchChapters();
  }, []);

  return { chapters, loading, error, refetch: fetchChapters };
}