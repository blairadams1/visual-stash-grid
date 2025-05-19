
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Folder } from '@/lib/bookmarkUtils';

/**
 * Hook for managing the page's UI state
 */
export const usePageState = () => {
  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // UI visibility state
  const [showForm, setShowForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Current context state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  
  // Recently imported flag
  const [justImported, setJustImported] = useState(false);
  
  // Presentation settings with persistence
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [cardSize, setCardSize] = useLocalStorage<'small' | 'medium' | 'large'>('cardSize', 'medium');
  
  return {
    // Search and filtering
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    
    // UI visibility
    showForm,
    setShowForm,
    showFolderForm,
    setShowFolderForm,
    isFilterOpen,
    setIsFilterOpen,
    showSidebar,
    setShowSidebar,
    
    // Current context
    currentFolderId,
    setCurrentFolderId,
    currentFolder,
    setCurrentFolder,
    selectedCollectionId,
    setSelectedCollectionId,
    
    // Import state
    justImported,
    setJustImported,
    
    // Presentation
    theme,
    setTheme,
    cardSize,
    setCardSize
  };
};
