import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Practice from '../components/Practice';
import { useShortcuts } from '../hooks/useShortcuts';
import { useCollections } from '../hooks/useCollections';
import LoadingSpinner from '../components/LoadingSpinner';

function PracticePage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { shortcuts: allShortcuts, loading: shortcutsLoading } = useShortcuts();
  const { collections, loading: collectionsLoading } = useCollections();

  if (shortcutsLoading || collectionsLoading) return <LoadingSpinner />;

  let practiceShortcuts = allShortcuts;
  let title = 'All Shortcuts';

  if (collectionId && collectionId !== 'all') {
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      practiceShortcuts = collection.shortcuts;
      title = collection.name;
    }
  }

  return (
    <Practice
      shortcuts={practiceShortcuts}
      title={title}
      onExit={() => navigate(-1)}
    />
  );
}

export default PracticePage