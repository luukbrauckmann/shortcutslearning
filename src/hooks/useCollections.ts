import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Collection } from '../types';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .order('name');

      if (collectionsError) throw collectionsError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('collection_items')
        .select(`
          collection_id,
          shortcuts (*)
        `);

      if (itemsError) throw itemsError;

      const processedCollections = collectionsData.map((collection: any) => ({
        ...collection,
        shortcuts: itemsData
          .filter((item: any) => item.collection_id === collection.id)
          .map((item: any) => item.shortcuts)
          .filter((shortcut: any) => shortcut !== null)
      }));

      setCollections(processedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  return { collections, loading, error, refetch: fetchCollections };
}