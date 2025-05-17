
import { useState, useEffect, useCallback } from 'react';
import { Collection, getDefaultCollections, createCollection } from '@/lib/bookmarkUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useCollections() {
  // State for collections from local storage
  const [collections, setCollections] = useLocalStorage<Collection[]>("collections", []);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Initialize with default collections if none exist
  useEffect(() => {
    if (collections.length === 0) {
      const defaultCollections = getDefaultCollections();
      setCollections(defaultCollections);
    }
    setLoading(false);
  }, []);
  
  // Add a new collection
  const addCollection = useCallback((name: string, parentId?: string, description?: string, color?: string) => {
    const newCollection = createCollection(name, collections, parentId, description, color);
    setCollections([...collections, newCollection]);
    return newCollection;
  }, [collections, setCollections]);
  
  // Update a collection
  const updateCollection = useCallback((id: string, updates: Partial<Collection>) => {
    setCollections(prevCollections => 
      prevCollections.map(collection => 
        collection.id === id ? { ...collection, ...updates } : collection
      )
    );
  }, [setCollections]);
  
  // Delete a collection
  const deleteCollection = useCallback((id: string) => {
    setCollections(prevCollections => 
      prevCollections.filter(collection => collection.id !== id)
    );
  }, [setCollections]);
  
  // Reorder collections
  const reorderCollections = useCallback((reorderedCollections: Collection[]) => {
    const updatedCollections = reorderedCollections.map((collection, index) => ({
      ...collection,
      order: index,
    }));
    
    setCollections(updatedCollections);
  }, [setCollections]);
  
  return {
    collections,
    loading,
    addCollection,
    updateCollection,
    deleteCollection,
    reorderCollections
  };
}
