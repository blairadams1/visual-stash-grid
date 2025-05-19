
import { useState, useEffect, useCallback } from 'react';
import { Folder, createFolder } from '@/lib/bookmarkUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function useFolders() {
  // State for folders from local storage
  const [folders, setFolders] = useLocalStorage<Folder[]>("folders", []);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Initialize state
  useEffect(() => {
    setLoading(false);
  }, []);
  
  // Add a new folder
  const addFolder = useCallback((name: string, image?: string, tags: string[] = []) => {
    const newFolder = createFolder(name, folders, image, tags);
    setFolders([...folders, newFolder]);
    return newFolder;
  }, [folders, setFolders]);
  
  // Update a folder
  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setFolders(prevFolders => 
      prevFolders.map(folder => 
        folder.id === id ? { ...folder, ...updates } : folder
      )
    );
  }, [setFolders]);
  
  // Delete a folder
  const deleteFolder = useCallback((id: string) => {
    setFolders(prevFolders => 
      prevFolders.filter(folder => folder.id !== id)
    );
  }, [setFolders]);
  
  // Reorder folders
  const reorderFolders = useCallback((reorderedFolders: Folder[]) => {
    const updatedFolders = reorderedFolders.map((folder, index) => ({
      ...folder,
      order: index,
    }));
    
    setFolders(updatedFolders);
  }, [setFolders]);
  
  return {
    folders,
    loading,
    addFolder,
    updateFolder,
    deleteFolder,
    reorderFolders
  };
}
