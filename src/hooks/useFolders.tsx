
import { useState, useEffect, useCallback } from 'react';
import { Folder, createFolder } from '@/lib/bookmarkUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/ui/use-toast';

export function useFolders() {
  // State for folders from local storage
  const [folders, setFolders] = useLocalStorage<Folder[]>("folders", []);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Initialize state
  useEffect(() => {
    setLoading(false);
  }, []);
  
  // Add a new folder
  const addFolder = useCallback((name: string, image?: string, tags: string[] = []) => {
    // Validate tags
    const validatedTags = tags
      .filter(tag => tag.trim().length > 0 && tag.trim().length <= 15 && !tag.includes('.'))
      .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
      
    const newFolder = createFolder(name, image, validatedTags, folders);
    setFolders([...folders, newFolder]);
    return newFolder;
  }, [folders, setFolders]);
  
  // Update a folder
  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    // Validate tags if present
    if (updates.tags) {
      updates.tags = updates.tags
        .filter(tag => tag.trim().length > 0 && tag.trim().length <= 15 && !tag.includes('.'))
        .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
    }
    
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
    toast({
      title: "Folder deleted",
    });
  }, [setFolders, toast]);
  
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
