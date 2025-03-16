import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Shortcut } from '../types';

export function useShortcuts() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShortcuts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('shortcuts')
        .select('*')
        .order('shortcut');

      if (fetchError) throw fetchError;
      setShortcuts(data || []);
    } catch (error) {
      console.error('Error fetching shortcuts:', error);
      setError('Failed to load shortcuts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortcuts();
  }, []);

  return { shortcuts, loading, error, refetch: fetchShortcuts };
}